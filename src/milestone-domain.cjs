/* Goal state rules; tasks remain centralized. No new XP reward formula. */
const MilestoneDomain=(()=>{
 const progress=m=>{const steps=m.steps||[],completed=steps.filter(s=>s.completed===true).length;return {total:steps.length,completed,percent:steps.length?Math.round(completed/steps.length*100):null}};
 const ordered=m=>[...(m.steps||[])].sort((a,b)=>a.order-b.order);
 const eligible=m=>m.status!=='archived'&&m.status!=='completed'&&progress(m).total>0&&progress(m).total===progress(m).completed;
 const migrate=data=>{data.milestones.forEach(m=>{if(!Array.isArray(m.steps))m.steps=[];m.steps.forEach((s,i)=>{if(!s.id)s.id=`${m.id}-legacy-step-${i}`;if(!Number.isFinite(s.order))s.order=i;if(s.name==null)s.name=s.title||'';s.completed=s.completed===true})});data.tasks.forEach(t=>{if(t.stepId&&!data.milestones.some(m=>m.id===t.milestone&&m.steps.some(s=>s.id===t.stepId)))t.stepId=''});return data};
 const reopen=m=>{if(m.status==='completed'){m.status='active';m.completedAt=null}};
 const addStep=(m,id,name)=>{if(m.status==='archived'||!name.trim()||m.steps.some(s=>s.id===id))return false;reopen(m);m.steps.push({id,name:name.trim(),completed:false,completedAt:null,order:Math.max(-1,...m.steps.map(s=>s.order))+1});return true};
 const setStep=(m,id,completed,now)=>{const s=m.steps.find(s=>s.id===id);if(!s||m.status==='archived'||s.completed===completed)return false;reopen(m);s.completed=completed;s.completedAt=completed?now:null;return true};
 const moveStep=(m,id,direction)=>{if(m.status==='archived'||![-1,1].includes(direction))return false;const steps=ordered(m),i=steps.findIndex(s=>s.id===id),target=i+direction;if(i<0||target<0||target>=steps.length)return false;[steps[i],steps[target]]=[steps[target],steps[i]];steps.forEach((s,order)=>{s.order=order});return true};
 const removeStep=(data,m,id)=>{if(m.status==='archived'||!m.steps.some(s=>s.id===id))return false;reopen(m);m.steps=m.steps.filter(s=>s.id!==id);data.tasks.filter(t=>t.milestone===m.id&&t.stepId===id).forEach(t=>{t.stepId=''});return true};
 const linkTask=(data,t,milestoneId,stepId)=>{const m=data.milestones.find(m=>m.id===milestoneId);t.milestone=m?milestoneId:'';t.stepId=m&&m.steps.some(s=>s.id===stepId)?stepId:''};
 const removeMilestone=(data,id)=>{data.milestones=data.milestones.filter(m=>m.id!==id);data.tasks.filter(t=>t.milestone===id).forEach(t=>{t.milestone='';t.stepId=''})};
 const complete=(m,now)=>{if(!eligible(m))return false;m.status='completed';m.completedAt=now;return true};
 return {progress,ordered,eligible,migrate,addStep,setStep,moveStep,removeStep,linkTask,removeMilestone,complete};
})();
if(typeof module!=='undefined')module.exports=MilestoneDomain;
