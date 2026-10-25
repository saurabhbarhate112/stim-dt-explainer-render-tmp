import vo from "../src/vo.json" with { type: "json" };
const D=[["hook",24,14],["factory",12,18],["mirror",12,14],["ai",12,14],["line",12,16],["predict",12,16],["simulate",12,16],["maintain",12,16],["limits",12,14],["payoff",12,14],["cta",12,150]];
let c=0;for(const [id,l,t] of D){const v=vo.find(x=>x.id===id);const d=l+Math.ceil(v.duration*30)+t;console.log(id,c,d,"vo@",c+l);c+=d-12;}
