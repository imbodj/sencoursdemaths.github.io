const a=e=>e.endsWith("/")?e.substring(0,e.length-1):e,o=e=>e.normalize("NFD").replace(new RegExp("\\p{Diacritic}","gu"),"").toLowerCase();export{o as n,a as r};
