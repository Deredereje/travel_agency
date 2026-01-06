const API_URL = "https://travel-agency-k1f9.onrender.com"; // 👈 CHANGE THIS

document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const whereTo = document.getElementById("whereTo").value;
  const howMany = document.getElementById("howMany").value;
  const arrivals = document.getElementById("arrivals").value;
  const leaving = document.getElementById("leaving").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  if (new Date(leaving) <= new Date(arrivals)) {
    alert("Leaving date must be after arrival date!");
    return;
  }

  const data = { whereTo, howMany, arrivals, leaving, name, email, phone };

  try {
    const res = await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log("Response from server:", result);

    document.getElementById("contactForm").reset();

    const msgDiv = document.getElementById("successMessage");
    msgDiv.innerText = "Booking submitted successfully!";
    msgDiv.style.display = "block";

    setTimeout(() => {
      msgDiv.style.display = "none";
    }, 5000);

  } catch (err) {
    console.error(err);
    alert("Error sending booking. Please try again.");
  }
});
