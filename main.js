function getFileContents(result_files) {
  let contents = []
  result_files.forEach((m) => {
    let data = m.data
    contents.push(data)
  })
  return contents
}

async function getHTMLContentFromFile(result_file) {
  async function readFile(file) {
    let result = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = (e) => resolve(fileReader.result);
        fileReader.readAsText(file)
    });
    return result;
  }
  return await readFile(result_file)
}

function insertHTMLView(content, elementId) {
  const readresult = document.getElementById(elementId)
  const new_element = document.createElement("result")
  new_element.innerHTML = content
  readresult.appendChild(new_element)
}

async function handleUploadResults(init_content) {
  for (i in init_content){
    let f = init_content[i]
    result = await getHTMLContentFromFile(f)
    html_results.push(result)
  }
  
  // for (i in html_results) {
  //   insertHTMLView(html_results[i], 'ReadResult')
  // }
  doConversion(html_results)
}

function doConversion(html_results) {
  var converter = new CanvasToQuizletConverter()
  var pairs = converter.convert_filelist_to_pairs(html_results)
  let pair_output = converter.write_pairs(pairs)
  let textbox = document.getElementById('output')
  textbox.textContent = pair_output
}

var html_results = []

var uppy = new Uppy.Core({restrictions: {allowedFileTypes: ['.html']}})
.use(Uppy.Dashboard, {
  inline: true,
  target: '#drag-drop-area'
})
.use(Uppy.Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })

uppy.on('complete', (result) => {
  var val = result.successful
  console.log('Upload complete! We’ve uploaded these files:', val)
  var files = uppy.getFiles()
  var init_content = getFileContents(files)
  handleUploadResults(init_content)
  }
)
