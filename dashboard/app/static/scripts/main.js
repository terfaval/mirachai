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
    const tags = [t.subcategory, ...(t.tags || []).slice(0,2)]
      .filter(Boolean)
      .join(', ');
    const mood = t.mood || t.mood_short || "";
    return `
      <div class="p-2 border-2 shadow-inner" style="background-color: #3E2515; border-color: #6B4226; box-shadow: inset 0 4px 8px rgba(0,0,0,0.4); width: 200px; height: 180px;">
        <div class="rounded-xl h-full w-full p-4 text-center" style="background-color: ${color};">
          <h2 class="font-cim text-xl font-bold">${t.name ?? ""}</h2>
          <p class="font-torzs text-sm italic mt-1">${mood}</p>
          <p class="font-torzs text-xs opacity-80 mt-1">${tags}</p>
        </div>
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