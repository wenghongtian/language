

for(let i = 0; i < 10; i = i + 1){
  fn add(){
    print(i)
  }
  
  let foo = { x: add };
  
  foo.x()
}
