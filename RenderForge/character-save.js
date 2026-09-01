// RenderForge Character Save
window.RenderForgeSave = {
 saveCharacter(data){
  const save={id:"RF-"+Date.now(),created:new Date().toISOString(),data:data};
  const list=JSON.parse(localStorage.getItem("RenderForgeCharacters")||"[]");
  list.push(save);
  localStorage.setItem("RenderForgeCharacters",JSON.stringify(list));
  return save;
 },
 getCharacters(){
  return JSON.parse(localStorage.getItem("RenderForgeCharacters")||"[]");
 }
};
