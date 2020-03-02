const canvas = document.querySelector('canvas')
canvas.style.border = "solid 1px lightgrey"
const ctx = canvas.getContext('2d')
const rect = canvas.getBoundingClientRect()
canvas.width = rect.width * 1.5
canvas.height = canvas.scrollHeight * 2.5
ctx.font = "20px sans-serif"
ctx.fillStyle = 'grey'
ctx.fillText('Перетащите сюда изображение', canvas.width/4 - 30, (canvas.height/2))

/*Метод, выполняющий все действия Drag'n'Drop для изображений на странице
  dragstart - начало перемещения объекта, использует метод MyDrag
  dragenter - при нахождении над канвасом, показывает что сюда можно бросить картинку
  dragover - при нахождении над канвасом срабатывает каждые 350мс 
  drop - выполняется, когда отпускают картинку, использует метод MyDrop */

const addEventListenerDrag = () => {
  document.querySelectorAll('img').forEach(item => {
    return item.addEventListener('dragstart', myDrag, false)
  })
  const drop = document.querySelector('section:nth-child(2)')
  drop.addEventListener('dragenter', (e) => {
    e.preventDefault();
  }, false)
  drop.addEventListener('dragover', (e) => {
    e.preventDefault()
  }, false)
  drop.addEventListener('drop', myDrop, false)
}

/* Метод, получающий src перетаскиваемого изображения в формате текста*/
const myDrag = (e) => {
  const image = e.target.getAttribute('src')
  e.dataTransfer.setData('Text', image)
}
/*Метод, который выпопляет закидывание картинки в область канваса:
  выполняет очистку канваса, расчет размера канваса под картинку, и отрисовку картинки*/
const myDrop = (e) => {
  e.preventDefault()
  const image = new Image();
  image.src = e.dataTransfer.getData('Text')
  image.onload = () => {
    image.style.backgroundColor = 'white'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let ratio = image.height / image.width
    canvas.height = canvas.width * ratio
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  }
}
/*Метод для работы D'n'D запускается после полной прогрузки страницы,
реализован при помощи слушателя load*/ 
window.addEventListener('load', addEventListenerDrag, false)

/*Метод, который берет поле files из объекта dataTransfer, содержащего список файлов для перетаскивания
  использует метод getImage*/
const dropImage = (e) => { 
  e.preventDefault()  
  const { files } = e.dataTransfer 
  getImages(files) 
} 

/*Метод, который получает информацию о файле с компьютера, перебирая массив(?) files
  reader.onloadend - срабатывает после чтения содержимого изображения
  reader.result - возвращает содержимое файла(URL), которое мы присваиваем как src изображения
  reader.readAsDataURL(file) - читает собержимое file, после окончания вызываетсобытие loadend
  */
const getImages = (files) =>{ 
  for (let file of files){
    const img = new Image();
    const reader = new FileReader() 
    reader.onloadend = () => {
      img.src = reader.result
    }
    reader.readAsDataURL(file) 

    img.onload = () => {
    img.style.backgroundColor = 'white'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let ratio = img.height / img.width
    canvas.height = canvas.width * ratio
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }
}

/*Метод для 'дропа' изображения с компьюреза запускается в момент 'дропа' */
canvas.addEventListener('drop', dropImage, false)


/*Получаем координаты курсора относительно области канваса и возвращаем массив значения по оси x и y*/
const getCursorPosition = (e) => { 
  const rect = canvas.getBoundingClientRect()
  let x = Math.round(e.clientX - rect.left)
  let y = Math.round(e.clientY - rect.top)
  return {
    x,
    y
  }
}

/*Метод, добавляющий инпут для ввода текста
  parseFloat получает значение интупа из свойств(было например 18087px) и преобразует в тип Float 
  выводит текст и удаляет инпут по нажатию Enter
  удаляет инпут по нажатию Esc*/
const InputText = (e) => {
  let mousePos = getCursorPosition(e)
  const section = document.querySelector('section:nth-child(2)')
  const input = document.createElement('input')

  section.style.position = 'relative'
  input.type = 'text'
  input.classList.add('input-style')
  input.style.left = (`${mousePos.x}px`)
  input.style.top = (`${mousePos.y}px`)
  input.value = ''

  section.appendChild(input)
  input.focus()

  input.addEventListener('keyup', (e) => {
    if (e.key == 'Enter' || e.keyCode == '13') {
      if (input) {
        ctx.font = "20px serif"
        const textCoordX = parseFloat(input.style.left)
        const textCoordY = parseFloat(input.style.top)
        ctx.fillText(`${input.value}`, textCoordX, textCoordY)
        section.removeChild(input)
      }
    }
    if (e.key == 'Esc' || e.keyCode == '27'){
      section.removeChild(input)
    }
  }, false)
}

/*Метод InputText запускается после клика по области канваса*/
canvas.addEventListener('click', InputText, false)

/*сохранение файла происходит после клика на элемент с id="saved" 
  т.к. у нас элемент a, то при получении URL холста заносим его в значение ссылки href
  после чего сохраняем под названием "mymeme" с расширением png*/
const link = document.getElementById('saved')
link.addEventListener('click', (e) => {
  link.href = canvas.toDataURL()
  link.download = "mymeme.png"
}, false)