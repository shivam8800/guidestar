const createCSVFile = require('csv-file-creator');
var data = [['roll','diceResult']];
var i,l;
/* generate data consisting of 10000 rolls of a six sided "random" die */
/* the data should be an array of array of numbers or strings */
for(i=1,l=10000;i<=l;++i) 
    data[i] = [i, 1+Math.floor(6*Math.random())];
/* output the csv file */
createCSVFile("dicerolls.csv", data);