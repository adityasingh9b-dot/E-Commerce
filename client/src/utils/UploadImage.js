import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const uploadImage = async (image) => {
    try {
        const formData = new FormData();
        formData.append('image', image);

        const response = await Axios({
            ...SummaryApi.uploadImage,
            data: formData
        });

        console.log("✅ Image Upload Success:", response); // ADD THIS
        return response;

    } catch (error) {
        console.error("❌ Image Upload Failed:", error?.response || error); // ADD THIS
        return error;
    }
};

export default uploadImage;

