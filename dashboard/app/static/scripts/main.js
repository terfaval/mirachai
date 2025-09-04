const state = { q: "", page: 1, per_page: 12 };
const grid = document.getElementById("grid");
const q = document.getElementById("q");

const categoryColors = {
  "Energia & Fókusz": "#FFE08A",
  "Gyümölcs & Virág": "#FFD1DC",
  "Immunitás & Tisztulás": "#C7E9B0",
  "Különleges Tradíciók": "#F0E68C",
  "Nyugalom & Álmodás": "#C3B1E1",
  "Spirituális & Meditatív": "#BDE0FE",
  "Élmény & Szezonális": "#FFDAC1"
};

async function fetchTeas(){
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  params.set("page", state.page);
  params.set("per_page", state.per_page);
  const res = await fetch(`/api/teas?${params.toString()}`);
  const data = await res.json();
  renderGrid(data);
}
function renderGrid(items){
  grid.innerHTML = items.map(t => {
    const color = categoryColors[t.category] || "#ffffff";
    return `
      <div class="p-4 bg-[#3e1f0d] rounded-md">
        <article class="flex flex-col items-center text-center gap-y-1 p-6 rounded-full" style="background-color: ${color};">
          <h3 class="font-bold text-lg text-black">${t.name ?? ""}</h3>
          <p class="text-base text-gray-800">${t.mood_short ?? ""}</p>
          <div class="flex flex-col gap-y-1 text-sm text-gray-700">
            <p>${t.subcategory ?? ""}</p>
            ${(t.tags || []).slice(0,2).map(x=>`<p>${x}</p>`).join("")}
          </div>
        </article>
      </div>
    `;
  }).join("");
}
q.addEventListener("input", (e)=>{
  state.q = e.target.value;
  state.page = 1;
  fetchTeas();
});
fetchTeas();