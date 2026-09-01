// RenderForge Archive
window.RenderForgeArchive={
 add(entry){
  const a=this.getAll(); a.push(entry);
  localStorage.setItem("RenderForgeArchive",JSON.stringify(a));
 },
 getAll(){
  return JSON.parse(localStorage.getItem("RenderForgeArchive")||"[]");
 }
};
