import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi";

const fetchUserDetails = async () => {
  try {
    const response = await Axios({
      ...SummaryApi.userDetails,
    });

    console.log("👤 User details fetched:", response.data);  // 👉 Add this

    if (response?.data?.success) {
      return response.data;
    } else {
      console.warn("User details fetch unsuccessful:", response?.data?.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user details:", error?.response?.data || error.message);
    return null;
  }
};


export default fetchUserDetails;

