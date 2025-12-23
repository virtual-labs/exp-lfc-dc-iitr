    const chartInstances = {};

    // Global plotData function to create/destroy charts as needed
    function plotData(canvasId, time, data, title, ylabel) {
      const ctx = document.getElementById(canvasId).getContext("2d");
      if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
      }
      chartInstances[canvasId] = new Chart(ctx, {
        type: "line",
        data: {
          labels: time,
          datasets: [{
            label: ylabel,
            data: data,
            borderColor: "blue",
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: title },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return ylabel + ': ' + context.parsed.y.toFixed(2);
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: "Time (s)" },
              ticks: {
                callback: function(value, index, ticks) {
                  return this.getLabelForValue(value).toFixed(2);
                }
              }
            },
            y: {
              title: { display: true, text: ylabel },
              ticks: {
                callback: function(value, index, ticks) {
                  return value.toFixed(2);
                }
              }
            }
          }
        }
      });
    }

    // Navigation functions
    function goHome() {
      document.querySelector('.single-area-container').classList.remove('visible');
      document.querySelector('.two-area-container').classList.remove('visible');
      document.querySelector('.initial-screen').classList.add('visible');
    }

    function showSingleArea() {
      document.querySelector('.initial-screen').classList.remove('visible');
      document.querySelector('.two-area-container').classList.remove('visible');
      document.querySelector('.single-area-container').classList.add('visible');
    }

    function showTwoArea() {
      document.querySelector('.initial-screen').classList.remove('visible');
      document.querySelector('.single-area-container').classList.remove('visible');
      document.querySelector('.two-area-container').classList.add('visible');
    }

    // Instructions Modal
    function openInstructions() {
      document.getElementById('instructionsModal').style.display = 'block';
    }

    function closeInstructions() {
      document.getElementById('instructionsModal').style.display = 'none';
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
      const modal = document.getElementById('instructionsModal');
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    }

    // Single Area Simulation and Plotting
    function generatePlots() {
      const Tg = parseFloat(document.getElementById("Tg").value);
      const Tt = parseFloat(document.getElementById("Tt").value);
      const R = parseFloat(document.getElementById("R").value);
      const D = parseFloat(document.getElementById("D").value);
      const M = parseFloat(document.getElementById("M").value);

      const delPc_initial = 0;
      const delPl_initial = 0;
      const delPc_var = parseFloat(document.getElementById("delPc_var").value);
      const delPl_var = parseFloat(document.getElementById("delPl_var").value);

      const t0 = 0;
      const tf = parseFloat(document.getElementById("tf").value);
      const h = parseFloat(document.getElementById("h").value);
      const n = Math.ceil((tf - t0) / h);
      const tc = parseFloat(document.getElementById("tc").value);

      const time = Array.from({ length: n }, (_, i) => t0 + i * h);
      const state = Array(n).fill(null).map(() => [0, 0, 0]);

      function f(t, state, delPl, delPc) {
        const [delPg, delPm, delW] = state;
        return [
          (delPc - delW / R - delPg) / Tg,
          (delPg - delPm) / Tt,
          (delPm - delPl - D * delW) / M
        ];
      }

      for (let i = 0; i < n - 1; i++) {
        const t = time[i];
        const s = state[i];
        const delPl = t >= tc ? delPl_var : delPl_initial;
        const delPc = t >= tc ? delPc_var : delPc_initial;

        const k1 = f(t, s, delPl, delPc);
        const s_temp = s.map((val, idx) => val + h * k1[idx]);
        const k2 = f(t + h, s_temp, delPl, delPc);
        state[i + 1] = s.map((val, idx) => val + 0.5 * h * (k1[idx] + k2[idx]));
      }

      const delPg = state.map(s => s[0]);
      const delPm = state.map(s => s[1]);
      const delW = state.map(s => s[2]);

      plotData("delWChart", time, delW, "Δω vs Time", "Δω");
      plotData("delPmChart", time, delPm, "ΔPM vs Time", "ΔPM");
      plotData("delPgChart", time, delPg, "ΔPG vs Time", "ΔPG");
    }

    // Two Area Simulation and Plotting
    function generateTwoAreaPlots() {
      const Tg1 = parseFloat(document.getElementById("Tg1").value);
      const Tt1 = parseFloat(document.getElementById("Tt1").value);
      const R1 = parseFloat(document.getElementById("R1").value);
      const D1 = parseFloat(document.getElementById("D1").value);
      const M1 = parseFloat(document.getElementById("M1").value);

      const Tg2 = parseFloat(document.getElementById("Tg2").value);
      const Tt2 = parseFloat(document.getElementById("Tt2").value);
      const R2 = parseFloat(document.getElementById("R2").value);
      const D2 = parseFloat(document.getElementById("D2").value);
      const M2 = parseFloat(document.getElementById("M2").value);

      const delPc1_initial = 0;
      const delPl1_initial = 0;
      const delPc1_var = parseFloat(document.getElementById("delPc1_var").value);
      const delPl1_var = parseFloat(document.getElementById("delPl1_var").value);

      const delPc2_initial = 0;
      const delPl2_initial = 0;
      const delPc2_var = parseFloat(document.getElementById("delPc2_var").value);
      const delPl2_var = parseFloat(document.getElementById("delPl2_var").value);

      const t02 = 0;
      const tf2 = parseFloat(document.getElementById("tf2").value);
      const tc2 = parseFloat(document.getElementById("tc2").value);

      const h2 = parseFloat(document.getElementById("h2").value);
      const Tie = 1;

      const n = Math.ceil((tf2 - t02) / h2);
      const time2 = Array.from({ length: n }, (_, i) => t02 + i * h2);
      const state2 = Array(n).fill(null).map(() => [0, 0, 0, 0, 0, 0, 0, 0]);

      function f(t, state2, delPl1, delPc1, delPl2, delPc2) {
        const [delPg1, delPm1, delW1, theta1, delPg2, delPm2, delW2, theta2] = state2;
        return [
          (delPc1 - delW1 / R1 - delPg1) / Tg1,
          (delPg1 - delPm1) / Tt1,
          (delPm1 - delPl1 - D1 * delW1 - Tie * (theta1 - theta2)) / M1,
          delW1,
          (delPc2 - delW2 / R2 - delPg2) / Tg2,
          (delPg2 - delPm2) / Tt2,
          (delPm2 - delPl2 - D2 * delW2 + Tie * (theta1 - theta2)) / M2,
          delW2
        ];
      }

      for (let i = 0; i < n - 1; i++) {
        const t2 = time2[i];
        const s2 = state2[i];
        const delPl1 = t2 >= tc2 ? delPl1_var : delPl1_initial;
        const delPc1 = t2 >= tc2 ? delPc1_var : delPc1_initial;
        const delPl2 = t2 >= tc2 ? delPl2_var : delPl2_initial;
        const delPc2 = t2 >= tc2 ? delPc2_var : delPc2_initial;

        const k1 = f(t2, s2, delPl1, delPc1, delPl2, delPc2);
        const s_temp2 = s2.map((val2, idx2) => val2 + h2 * k1[idx2]);
        const k2 = f(t2 + h2, s_temp2, delPl1, delPc1, delPl2, delPc2);
        state2[i + 1] = s2.map((val2, idx2) => val2 + 0.5 * h2 * (k1[idx2] + k2[idx2]));
      }

      const delW1 = state2.map(s2 => s2[2]);
      const delW2 = state2.map(s2 => s2[6]);
      const delP12 = state2.map(s2 => Tie * (s2[3] - s2[7]));

      plotData("delW1Chart", time2, delW1, "Δω1 vs Time", "Δω1");
      plotData("delW2Chart", time2, delW2, "Δω2 vs Time", "Δω2");
      plotData("tieLineChart", time2, delP12, "Tie Line Power vs Time", "ΔP12");
    }
