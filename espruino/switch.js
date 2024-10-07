

console.log('33 high');


      digitalWrite(33,1);
      
      
      
      
      pinMode(35,'input_pullup');
      
      
      setWatch(function(e) {
        console.log("Button pressed");
      },35,{repeat:true,edge:'rising',debounce: 15});
      
      
      
      setWatch(function(e) {
        console.log("Button released");
      },35,{repeat:true,edge:'falling',debounce: 15});
      
      
      
      
      