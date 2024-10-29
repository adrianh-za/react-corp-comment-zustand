import { Pattern } from "./Pattern.tsx";
import { Logo } from "./Logo.tsx";
import { PageHeading } from "./PageHeading.tsx";
import { FeedbackForm } from "../feedback/FeedbackForm.tsx";
import { useFeedbackItemsStore } from "../../stores/feedbackItemsStore.ts";

export const Header = () => {

  const handleAddFeedbackItem = useFeedbackItemsStore(state => state.addFeedbackItem);

  return (
    <header>
      <Pattern/>
      <Logo/>
      <PageHeading/>
      <FeedbackForm onAddFeedbackItem={handleAddFeedbackItem}/>
    </header>
  )
}
