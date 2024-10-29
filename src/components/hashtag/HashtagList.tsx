import { HashtagItem } from "./HashtagItem.tsx";
import { useFeedbackItemsStore } from "../../stores/feedbackItemsStore.ts";

export const HashtagList = () => {

  const companies = useFeedbackItemsStore(state => state.getCompanyNames());
  const handleSelectCompany = useFeedbackItemsStore(state => state.selectCompany);

  //Sort company names by count desc
  const sortedCompanies = Object.entries(companies)
    .sort((a, b) => b[1] - a[1]);

  return (
    <ul className="hashtags">
      {sortedCompanies.map((companyNameCount) => {
        return (
          <HashtagItem
            key={companyNameCount[0]}
            companyName={companyNameCount[0]}
            companyNameCount={companyNameCount[1]}
            onClick={handleSelectCompany}
          />
        )
      })
      }
    </ul>
  )
}
