const state = { q: "", page: 1, per_page: 24 };
const grid = document.getElementById("grid");
const q = document.getElementById("q");
const pageEl = document.getElementById("page");

async function fetchTeas(){
  const params = new URLSearchParams();
  if(state.q) params.set("q", state.q);
  params.set("page", state.page);
  params.set("per_page", state.per_page);
  const res = await fetch(`/api/teas?${params.toString()}`);
  const total = Number(res.headers.get("X-Total-Count") || "0");
  const data = await res.json();
  renderGrid(data);
  renderPager(total);
}
function renderGrid(items){
  grid.innerHTML = items.map(t => `
    <article class="border rounded-2xl p-4 shadow-sm hover:shadow">
      <h3 class="font-head text-2xl mb-1">${t.name ?? ""}</h3>
      <p class="text-sm text-zinc-600 mb-2">${t.category ?? ""}${t.subcategory ? " • " + t.subcategory : ""}</p>
      <div class="flex flex-wrap gap-2 mb-3">
        ${(t.tags || []).slice(0,3).map(x=>`<span class="text-xs border rounded-full px-2 py-0.5">${x}</span>`).join("")}
      </div>
      <div class="text-sm">
        <strong>Forrázás:</strong>
        ${(t.tempC ?? "—")}°C • ${(t.steepMin ?? "—")} perc
      </div>
    </article>
  `).join("");
}
function renderPager(total){
  const maxPage = Math.max(1, Math.ceil(total / state.per_page));
  pageEl.textContent = `${state.page} / ${maxPage}`;
  document.getElementById("prev").disabled = (state.page <= 1);
  document.getElementById("next").disabled = (state.page >= maxPage);
}
q.addEventListener("input", (e)=>{
  state.q = e.target.value;
  state.page = 1;
  fetchTeas();
});
document.getElementById("reset").addEventListener("click", ()=>{
  state.q = "";
  q.value = "";
  state.page = 1;
  fetchTeas();
});
document.getElementById("prev").addEventListener("click", ()=>{ state.page=Math.max(1,state.page-1); fetchTeas(); });
document.getElementById("next").addEventListener("click", ()=>{ state.page=state.page+1; fetchTeas(); });

fetchTeas();