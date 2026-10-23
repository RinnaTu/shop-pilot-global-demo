// 仅用于简历展示的虚构商品数据；不连接真实商品或模型服务。
const sampleProducts = [
  { id: "p1", name: "轻行折叠旅行包", category: "travel", price: 219, shipping: 28, traits: ["light", "design"], detail: "可折叠收纳，适合周末短途与随身携带。" },
  { id: "p2", name: "都市轻量双肩包", category: "commute", price: 268, shipping: 25, traits: ["light", "durable"], detail: "分层收纳电脑与日常用品，通勤更从容。" },
  { id: "p3", name: "模块化旅行收纳套组", category: "organize", price: 139, shipping: 22, traits: ["light", "design"], detail: "多尺寸组合，帮助整理衣物与随行小物。" },
  { id: "p4", name: "耐磨周末旅行袋", category: "travel", price: 289, shipping: 36, traits: ["durable", "design"], detail: "挺括耐用，适合需要更多容量的短途出行。" },
  { id: "p5", name: "简约日常托特包", category: "commute", price: 189, shipping: 24, traits: ["design", "light"], detail: "外形简洁，适合轻装通勤与城市漫步。" },
  { id: "p6", name: "旅行分装收纳袋", category: "organize", price: 99, shipping: 18, traits: ["durable", "design"], detail: "分隔常用物品，减少行李翻找时间。" },
];

const categoryNames = { travel: "短途旅行", commute: "日常通勤", organize: "行李收纳" };
const traitNames = { light: "轻便", durable: "耐用", design: "简洁设计" };
const form = document.querySelector("#shopping-form");
const result = document.querySelector("#result");

const workspaceGuide = {
  agent: ["选购助手", "把自然语言需求整理为可比较的条件，并在推荐时说明理由。"],
  wishlist: ["我的心愿单", "集中保存感兴趣的商品，回看价格与亮点，帮助用户比较取舍。"],
  skills: ["我的 Skill", "保存可复用的选购步骤和偏好，让下一次选购从熟悉的方法开始。"],
};
const workspaceTabs = [...document.querySelectorAll(".workspace-tab")];
function selectWorkspacePanel(name) {
  for (const tab of workspaceTabs) {
    const selected = tab.dataset.panel === name;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.querySelector(`#panel-${tab.dataset.panel}`).hidden = !selected;
  }
  document.querySelector("#workspace-guide-title").textContent = workspaceGuide[name][0];
  document.querySelector("#workspace-guide-text").textContent = workspaceGuide[name][1];
}
for (const [index, tab] of workspaceTabs.entries()) {
  tab.addEventListener("click", () => selectWorkspacePanel(tab.dataset.panel));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = workspaceTabs[(index + (event.key === "ArrowRight" ? 1 : -1) + workspaceTabs.length) % workspaceTabs.length];
    selectWorkspacePanel(next.dataset.panel);
    next.focus();
  });
}

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function renderMatches(category, budget, preference) {
  const matches = sampleProducts
    .filter((product) => product.category === category && product.price + product.shipping <= budget)
    .sort((a, b) => Number(b.traits.includes(preference)) - Number(a.traits.includes(preference)) || a.price + a.shipping - b.price - b.shipping)
    .slice(0, 2);

  result.replaceChildren();
  const topLine = element("div", "card-topline");
  topLine.append(element("span", "", "THE SHORTLIST"), element("span", "", "02 / 03"));
  result.append(topLine);

  if (!matches.length) {
    const empty = element("div", "empty-match");
    empty.append(element("strong", "", "暂时没有匹配项。"), element("span", "", "试着提高预算，或切换一个选购场景。"));
    result.append(empty);
    return;
  }

  const summary = element("div", "result-summary");
  summary.append(element("h3", "", `为你的${categoryNames[category]}挑选`), element("span", "result-tag", "模拟结果"));
  result.append(summary, element("p", "result-intro", `预算 ¥${budget} 以内，更看重${traitNames[preference]}。以下是匹配的样例商品：`));
  const list = element("div", "product-list");
  for (const product of matches) {
    const card = element("article", "product");
    const row = element("div", "product-top");
    const heading = element("div", "");
    heading.append(element("h4", "", product.name), element("small", "", `商品 ¥${product.price} + 示意运费 ¥${product.shipping}`));
    row.append(heading, element("span", "product-price", `¥${product.price + product.shipping}`));
    card.append(row);
    const reason = product.traits.includes(preference)
      ? `契合你看重的“${traitNames[preference]}”：${product.detail}`
      : `价格在预算内：${product.detail}`;
    card.append(element("p", "", reason));
    const meta = element("div", "product-meta");
    for (const trait of product.traits) meta.append(element("span", "", traitNames[trait]));
    card.append(meta);
    list.append(card);
  }
  result.append(list);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const category = form.elements.category.value;
  const preference = form.elements.preference.value;
  const budget = Number(form.elements.budget.value);
  if (!categoryNames[category] || !traitNames[preference] || !Number.isFinite(budget) || budget < 80 || budget > 2000) {
    form.elements.budget.setCustomValidity("请输入 80 到 2000 元之间的预算。");
    form.reportValidity();
    return;
  }
  form.elements.budget.setCustomValidity("");
  renderMatches(category, budget, preference);
  if (window.matchMedia("(max-width: 740px)").matches) result.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.elements.budget.addEventListener("input", () => form.elements.budget.setCustomValidity(""));
