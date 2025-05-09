export async function uploadImagesToCloudinary(files) {
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "playvault_images_storage"); // Thay bằng upload preset của bạn trên Cloudinary
  
      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dqnj8bsgu/image/upload", // Thay bằng cloud name của bạn trên Cloudinary
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error("Lỗi tải ảnh lên:", error);
      }
    }
    return uploadedUrls;
  }