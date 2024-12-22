const play = document.getElementById("play");
const pause = document.getElementById("pause");
const flag = document.getElementById("flag");

const countdownTimer = {
   time: 0,
   intervalId: null,
   startState: false,
   lastSecond: null,
   lastTimestamp: null,
   timeOutput: document.getElementById("time"),
   millisecondsOutput: document.getElementById("milliseconds"),
   num: 1,
   pastLap: 0,

   saveState: function () {
      localStorage.setItem("stopwatch", JSON.stringify({
         time: this.time,
         startState: this.startState,
         lastTimestamp: this.startState ? Date.now() : null,
         laps: document.querySelector("tbody").innerHTML,
         num: this.num,
         pastLap: this.pastLap,
      }));
   },

   loadState: function () {
      const savedState = JSON.parse(localStorage.getItem("stopwatch"));
      if (savedState) {
         this.time = savedState.time;
         this.startState = savedState.startState;
         this.num = savedState.num;
         this.pastLap = savedState.pastLap;
         document.querySelector("tbody").innerHTML = savedState.laps || "";
         this.lastTimestamp = savedState.lastTimestamp;

         if (this.startState && this.lastTimestamp) {
            const elapsed = Date.now() - this.lastTimestamp;
            this.time += elapsed;
         }

         this.updateDisplay();

         if (this.startState) {
            play.style.display = "none";
            pause.style.display = "block";
            flag.style.opacity = "1";
         } else {
            play.style.display = "block";
            pause.style.display = "none";
            flag.style.opacity = "0.3";
         }
      }
   },

   start: function () {
      if (!this.startState) {
         this.startState = true;
         flag.style.opacity = "1";
         play.style.display = "none";
         pause.style.display = "block";
         this.lastTimestamp = Date.now();
         this.intervalId = setInterval(() => {
            const now = Date.now();
            this.time += now - this.lastTimestamp;
            this.lastTimestamp = now;
            this.updateDisplay();
            this.saveState();
         }, 10);
      }
   },

   reset: function (m = false) {
      this.time = 0;
      this.startState = false;
      flag.style.opacity = "0.3";
      play.style.display = "block";
      pause.style.display = "none";
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.num = 1;
      this.pastLap = 0;
      this.lastTimestamp = null;
      document.querySelector("tbody").innerHTML = "";
      this.updateDisplay();
      this.saveState();
   },

   stops: function () {
      if (this.startState) {
         this.startState = false;
         play.style.display = "block";
         pause.style.display = "none";
         flag.style.opacity = "0.3";
         clearInterval(this.intervalId);
         this.intervalId = null;
         this.lastTimestamp = null;
         this.saveState();
      }
   },

   updateDisplay: function () {
      const formattedTime = this.formatTime();
      this.timeOutput.textContent = formattedTime.timeString;
      this.millisecondsOutput.textContent = `.${formattedTime.milliseconds}`;
      document.title = formattedTime.timeString;
   },

   formatTime: function () {
      const hrs = Math.floor(this.time / 3600000);
      const mins = Math.floor((this.time % 3600000) / 60000);
      const secs = Math.floor((this.time % 60000) / 1000);
      const millis = Math.floor((this.time % 1000) / 10);
      return {
         timeString: `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
         milliseconds: millis.toString().padStart(2, "0"),
         seconds: secs,
      };
   },

   formatLapTime: function (lapTime) {
      const hrs = Math.floor(lapTime / 3600000);
      const mins = Math.floor((lapTime % 3600000) / 60000);
      const secs = Math.floor((lapTime % 60000) / 1000);
      const millis = Math.floor((lapTime % 1000) / 10);
      return {
         timeString: `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
         milliseconds: millis.toString().padStart(2, "0"),
      };
   },

   laps: function () {
      if (this.startState) {
         const lapTime = this.time - this.pastLap; // Time between last lap and current lap
         const lapFormatted = this.formatLapTime(lapTime); // Format lap time
         document.querySelector("tbody").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
               <td>${this.num}</td>
               <td>${lapFormatted.timeString}.${lapFormatted.milliseconds}</td>
               <td>${this.formatTime().timeString}.${this.formatTime().milliseconds}</td>
            </tr>
         `
         );
         this.num++;
         this.pastLap = this.time; // Update pastLap to the current time
         this.saveState();
      }
   },
};

document.getElementById("start").addEventListener("click", () => {
   play.style.display == "block" ? countdownTimer.start() : countdownTimer.stops();
});

document.getElementById("reset").addEventListener("click", () => countdownTimer.reset());

flag.addEventListener("click", () => countdownTimer.laps());

// Load state on page load
window.addEventListener("load", () => {
   countdownTimer.loadState();

   // Ensure display updates actively after reload if timer was running
   if (countdownTimer.startState && countdownTimer.intervalId === null) {
      countdownTimer.lastTimestamp = Date.now(); // Set lastTimestamp for correct time calculation
      countdownTimer.intervalId = setInterval(() => {
         const now = Date.now();
         countdownTimer.time += now - countdownTimer.lastTimestamp;
         countdownTimer.lastTimestamp = now;
         countdownTimer.updateDisplay();
         countdownTimer.saveState();
      }, 10);
   }
});

