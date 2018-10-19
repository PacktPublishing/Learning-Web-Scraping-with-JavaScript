var //Read/Save the items in wholeItems 
  wholeItems = document.querySelector('#s-results-list-atf').children,
  //An array to save the data
  allItems = [];

for (var index = 0; index < wholeItems.length; index++) {//Loop
  var item = {};
  
  //Save the price     
  if (wholeItems[index].classList.contains("AdHolder")) {//It is category 1
    if (wholeItems[index].querySelectorAll('.a-offscreen')[1]) item.price = wholeItems[index].querySelectorAll('.a-offscreen')[1].innerText;
  } 
    else {//It is category 2
    if (wholeItems[index].querySelector('.a-offscreen')) item.price = wholeItems[index].querySelector('.a-offscreen').innerText;
  }
  //Save the description
  if (wholeItems[index].querySelector('h2')) item.title = wholeItems[index].querySelector('h2').innerText;
  //Save the description and the price into the allItems
  if (Object.keys(item).length === 2) {
    allItems.push(item);
  }
}

console.log(allItems);

copy(allItems)