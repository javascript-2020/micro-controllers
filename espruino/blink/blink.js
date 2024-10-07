        


        var time    =  200;
        var state   =  0;
      

        function swap(){

              state    =  !state;
              digitalWrite(LED1,state);

        }//swap

        setInterval(swap,time);



