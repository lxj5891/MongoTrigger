#/bin/bash
echo "run test case4" 
echo "" 

 i=1
 while [ $i -le 20 ]
 do
     echo " index : " + $i
     i=$(( $i + 1 ))

     mongo < test_case5.js
     sleep 1s
 done