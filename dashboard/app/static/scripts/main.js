const state = { q: "", page: 1, per_page: 12 };
const grid = document.getElementById("grid");
const q = document.getElementById("q");

const categoryColors = window.CATEGORY_COLORS || {};

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
    const tags = [t.subcategory, ...(t.tags || []).slice(0,2)].filter(Boolean).join(', ');
    return `
      <div class="bg-[#3E2515] rounded-lg shadow-inner drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
        <article class="py-3 px-4 rounded-lg" style="background-color: ${color};">
          <h2 class="font-cim text-xl font-bold">${t.name ?? ""}</h2>
          <p class="font-torzs text-base italic">${t.mood_short ?? ""}</p>
          <p class="font-torzs text-sm opacity-80">${tags}</p>
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