if (document.getElementById("details")) {
    document.getElementById("details").addEventListener("submit", function (event) {
        
        event.preventDefault(); // STOP the page from refreshing

        // get values
        var height = Number(document.getElementById("Height").value);
        var weight = Number(document.getElementById("Weight").value);
        var age = Number(document.getElementById("Age").value);
        var activity = document.getElementById("Activity").value;
        var gender = document.querySelector('input[name="Gender"]:checked').value;

        // store in localStorage
        localStorage.setItem("height", height);
        localStorage.setItem("weight", weight);
        localStorage.setItem("age", age);
        localStorage.setItem("gender", gender);
        localStorage.setItem("activity", activity);

        window.location.href = "target.html"; 
    });
}


document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("maintain")) {
        var height = Number(localStorage.getItem("height"));
        var weight = Number(localStorage.getItem("weight"));
        var age = Number(localStorage.getItem("age"));
        var gender = localStorage.getItem("gender");
        var activity = localStorage.getItem("activity");

        var bmr;
        if (gender === "Male") {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        var tdee;
        if (activity === "sedentary") {
            tdee = bmr * 1.2;
        } else if (activity === "light") {
            tdee = bmr * 1.375;
        } else if (activity === "moderate") {
            tdee = bmr * 1.55;
        } else if (activity === "active") {
            tdee = bmr * 1.725;
        } else {
            tdee = bmr * 1.9;
        }

        tdee = Math.round(tdee);

        // fill table
        document.getElementById("maintain").innerText = tdee + " kcal";
        document.getElementById("loss1").innerText = (tdee - 250) + " kcal";
        document.getElementById("loss2").innerText = (tdee - 500) + " kcal";
        document.getElementById("loss3").innerText = (tdee - 1000) + " kcal";
        document.getElementById("gain1").innerText = (tdee + 250) + " kcal";
        document.getElementById("gain2").innerText = (tdee + 500) + " kcal";
        document.getElementById("gain3").innerText = (tdee + 1000) + " kcal";
    }
});