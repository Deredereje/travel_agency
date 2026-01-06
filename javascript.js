const API_URL = "https://travel-agency-k1f9.onrender.com"; // 👈 Your Render backend

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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  const result = await res.json();
  console.log("Server response:", result);

  document.getElementById("contactForm").reset();
  alert("Booking submitted successfully!");

} catch (err) {
  console.error("Booking error:", err);
  alert(err.message || "Failed to send booking");
}

});

window.toggleReadMore = function () {
  const dots = document.getElementById("dots");
  const moreText = document.getElementById("more-text");
  const btn = document.getElementById("about-btn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    moreText.style.display = "none";
    btn.innerText = "Read more";
  } else {
    dots.style.display = "none";
    moreText.style.display = "inline";
    btn.innerText = "Read less";
  }
  
};

