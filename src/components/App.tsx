import { Footer } from "./layout/Footer.tsx";
import { Container } from "./layout/Container.tsx";
import { HashtagList } from "./hashtag/HashtagList.tsx";
import { useEffect } from "react";
import { useFeedbackItemsStore } from "../stores/feedbackItemsStore.ts";

function App() {

  const loadFeedbackItems = useFeedbackItemsStore(state => state.loadFeedbackItems);

  useEffect(() => {
    loadFeedbackItems();
  }, []);

  return (
    <div className="app">
      <Footer/>
      <Container/>
      <HashtagList/>
    </div>
  )
}

export default App


