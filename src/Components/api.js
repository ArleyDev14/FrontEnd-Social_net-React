export const fetchFeed = async (username) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token enviado:", token);

    const response = await fetch(`http://localhost:8080/api/posts/feed/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener los datos: ${errorText}`);
    }

    const data = await response.json();
    console.log("Datos recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};