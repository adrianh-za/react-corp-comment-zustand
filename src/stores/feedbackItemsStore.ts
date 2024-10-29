import { create } from "zustand";
import { TFeedbackItem } from "../lib/types.ts";
import { getErrorMessage } from "../lib/utils.ts";

type Store = {
  feedbackItems: TFeedbackItem[],
  isLoading: boolean,
  errorMessage: string,
  selectedCompany: string,

  addFeedbackItem: (text: string) => Promise<void>,
  selectCompany: (company: string) => void,
  loadFeedbackItems: () => Promise<void>,
  saveFeedbackItem: (newFeedbackItem: TFeedbackItem) => Promise<void>,
  getCompanyNames: () => Record<string, number>,
  getFilteredFeedbackItems: () => TFeedbackItem[],
}

export const useFeedbackItemsStore = create<Store>((set, get) => ({
  feedbackItems: [],
  isLoading: false,
  errorMessage: "",
  selectedCompany: "",

  //Add feedback item to server and refresh items
  addFeedbackItem: async (text: string) => {
    //Get the company name by looking for the word that starts with #
    const companyName = text
      .split(" ")
      .find(word => word.startsWith("#"));

    //Company name must consists of at least 2 characters (# and the first letter)
    if (!companyName || companyName.length < 2)
      throw new Error("Company name starting with # not found in feedback text.");

    //Create a new feedback item object
    const newFeedbackItem: TFeedbackItem = {
      id: -1,  //Will be updated by the "server"
      upvoteCount: 0,
      text: text,
      badgeLetter: companyName[0].toUpperCase(),
      company: companyName.substring(1),
      daysAgo: 0,
    }

    //Save items to the server
    await get().saveFeedbackItem(newFeedbackItem);

    //Fetch the updated items
    await get().loadFeedbackItems();
  },

  //Select the specified company
  selectCompany: (company: string) => {
    set(() => ({ selectedCompany: company }))
  },

  //Loads the feedback items from the server
  loadFeedbackItems: async () => {
    set(() => ({ isLoading: true }))
    set(() => ({ errorMessage: "" }))

    try {
      const resp = await fetch("https://bytegrad.com/course-assets/projects/corpcomment/api/feedbacks");

      //Handle non-200 status codes
      if (!resp.ok) {
        set(() => ({ errorMessage: "An error occurred while fetching feedback items. Code: " + resp.status }))
        return;
      }

      //Get the data and populate state
      const data = await resp.json();
      set(() => ({ feedbackItems: data.feedbacks }));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set(() => ({ errorMessage: errorMessage }))
    } finally {
      set(() => ({ isLoading: false }))
    }
  },

  //Save the specified feedback item to the server
  saveFeedbackItem: async (newFeedbackItem: TFeedbackItem) => {
    //Get the max feedback ID and increment it by 1
    const maxId = get().feedbackItems
      .reduce((max, item) => item.id > max ? item.id : max, 0);

    newFeedbackItem.id = maxId + 1;  //Only for this project, in real world, this should be handled by the server

    try {
      const resp = await fetch("https://bytegrad.com/course-assets/projects/corpcomment/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(newFeedbackItem),
      })

      //Handle non-200 status codes
      if (!resp.ok) {
        set(() => ({ errorMessage: "An error occurred while fetching feedback items. Code: " + resp.status }))
        return;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set(() => ({ errorMessage: errorMessage }))
    }
  },

  //Gets a unique list of company names and their usage counts
  getCompanyNames: (): Record<string, number> => {
    return get().feedbackItems.reduce((acc, feedbackItem) => {
      const companyName = feedbackItem.company.trim().toLowerCase();
      acc[companyName] = (acc[companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  //Gets the feedback items filtered by the selected company, or all if no company is selected
  getFilteredFeedbackItems: () => {
    const state = get();
    return state.selectedCompany !== ""
      ? state.feedbackItems.filter((feedbackItem) => feedbackItem.company.trim().toLowerCase() === state.selectedCompany)
      : state.feedbackItems
  },
}));