//loads in the data from the cleaned CSV file of our movie dataset
d3.csv("data/data_bechdel_new - data_bechdel.csv").then((data) => {
  
  //prints the first 20 rows of our dataset
  for (var i = 0; i < 20; i++) {
    console.log(data[i]);
  }
});