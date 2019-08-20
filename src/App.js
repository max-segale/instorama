import React from 'react';
import logo from './logo.svg';
import './App.css';

function DescText(props) {
  let text = (
    <div>
      <h1>Crop a panorama for Instagram </h1>
      <h2>so it can be seemlessly swiped through, </h2>
      <h3><span>for a better view. 👍🏻 </span></h3>
    </div>
  );
  if (props.done) {
    text = 'Click each photo to download it to your device.';
  }
  return (
    <div className='desc'>
      {text}
    </div>
  );
}

function ImgInput(props) {
  let theClass = 'img_input';
  if (props.img) {
     theClass += ' hide';
  }
  return (
    <div className={theClass}>
      <input type='file' onChange={props.onInput} />
    </div>
  );
}

function ImgView(props) {
  let theClass = 'img_view';
  let display = null;
  if (props.imgWidth && props.imgHeight) {
    display = (
      <div className='pano'>
        <img src={props.imgData} alt='panorama' />
        <CropBoxes
          imgWidth={props.imgWidth}
          imgHeight={props.imgHeight}
          startX={props.startX}
          onView={props.onView}
        />
      </div>
    );
  } else {
    display = (
      <div className='pano_place'>
        <div className='holder'>
          <div className='logo'></div>
        </div>
      </div>
    );
  }
  if (props.cropDone) {
    theClass += ' hide';
  }
  return <div className={theClass}>{display}</div>;
}

function ImgResult(props) {
  const results = [];
  const imgWidth = props.imgHeight;
  let cropX = props.startX;
  let theClass = 'img_result';
  if (!props.cropDone) {
    theClass += ' hide';
  }
  for (let b = 0; b < props.boxCount; b += 1) {
    if (b > 0) {
      cropX += imgWidth;
    }
    results.push(
      <li key={b}>
        <ImgCanvas
          num={b + 1}
          img={props.img}
          width={imgWidth}
          height={imgWidth}
          cropX={cropX}
        />
      </li>
    );
  }
  return (
    <div className={theClass}>
      <ul>
        {results}
      </ul>
      <button className='back' onClick={props.onBack}>Back</button>
    </div>
  );
}

class CropBoxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widthPct: 0,
      boxes: [],
      boxesStyle: {}
    }
  }
  componentDidMount() {
    const boxCount = Math.floor(this.props.imgWidth / this.props.imgHeight);
    const widthRem = this.props.imgWidth - (boxCount * this.props.imgHeight);
    const widthRemPct = widthRem * 100 / this.props.imgWidth;
    const widthPct = 100 - widthRemPct;
    const startX = widthRem / 2;
    const boxes = [];
    let divider = null;
    for (let b = 0; b < boxCount; b += 1) {
      if (b > 0) {
        divider = <div className='divider'></div>;
      }
      boxes.push(
        <li
          key={b}
          className='box'
        >
          {divider}
        </li>
      );
    }
    this.props.onView(boxCount, startX, widthRem);
    this.setState({
      widthPct: widthPct,
      boxes: boxes
    });
  }
  componentDidUpdate(prevProps) {
    let startXPct = 0;
    if (this.props.startX !== prevProps.startX) {
      startXPct = this.props.startX * 100 / this.props.imgWidth;
      this.setState({
        boxesStyle: {
          width: this.state.widthPct + '%',
          left: startXPct + '%'
        }
      });
    }
  }
  render() {
    return (
      <ul className='boxes' style={this.state.boxesStyle}>
        {this.state.boxes}
      </ul>
    );
  }
}

class ImgControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: this.props.startX
    }
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.props.onStartX(e);
    this.setState({
      x: e.target.value
    });
  }
  render() {
    let theClass = 'img_controls';
    if (this.props.boxCount === 0 || this.props.cropDone) {
      theClass += ' hide';
    }
    return (
      <div className={theClass}>
        <button className='cancel' onClick={this.props.onCancel}>Cancel</button>
        <div>
          <input
            type='range'
            min='0'
            max={this.props.maxX}
            value={this.props.startX}
            onChange={this.handleChange}
          />
          <br />
          <span>Adjust Position</span>
        </div>
        <button className='finish' onClick={this.props.onFinish}>Finish</button>
      </div>
    );
  }
}

class ImgCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.fileName = 'Instorama';
    this.canvasRef = React.createRef();
    this.state = {
      context: null
    }
  }
  componentDidMount() {
    const ctx = this.canvasRef.current.getContext('2d');
    this.setState ({
      context: ctx
    });
  }
  componentDidUpdate() {
    const imgX = this.props.cropX * -1;
    if (this.props.img) {
      //console.log(imgX);
      this.state.context.drawImage(this.props.img, imgX, 0);
    }
  }
  handleClick(e) {
    const theCanvas = this.canvasRef.current;
    const theURL = theCanvas.toDataURL('image/jpeg');
    const theLink = theCanvas.parentNode;
    theLink.href = theURL;
  }
  render() {
    return (
      <a download={this.fileName} onClick={() => this.handleClick()}>
        <canvas
          ref={this.canvasRef}
          width={this.props.width}
          height={this.props.height}
        >
        </canvas>
        <div className='counter'>{this.props.num}</div>
      </a>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgInput: null,
      img: null,
      imgData: '',
      imgWidth: 0,
      imgHeight: 0,
      startX: 0,
      maxX: 0,
      boxWidth: 0,
      boxCount: 0,
      cropDone: false
    }
  }
  handleInput(imgInput) {
    const imgFile = imgInput.files[0];
    const fReader = new FileReader();
    fReader.onload = () => {
      const img = new Image();
      const imgSrc = fReader.result;
      img.src = imgSrc;
      img.onload = () => {
        this.setState({
          img: img,
          imgWidth: img.width,
          imgHeight: img.height
        });
      };
      this.setState ({
        imgData: imgSrc
      });
    };
    fReader.readAsDataURL(imgFile);
    this.setState({
      imgInput: imgInput
    });
  }
  handleView(boxCount, startX, maxX) {
    this.setState({
      boxCount: boxCount,
      startX: startX,
      maxX: maxX
    });
  }
  handleStartX(input) {
    this.setState({
      startX: Number(input.value)
    });
  }
  handleCancel() {
    this.state.imgInput.value = '';
    this.setState({
      img: null,
      imgWidth: 0,
      imgHeight: 0,
      boxCount: 0,
      cropDone: false
    });
  }
  handleFinish() {
    if (this.state.boxCount > 0) {
      this.setState({
        cropDone: true
      });
    }
  }
  handleBack() {
    this.setState({
      cropDone: false
    });
  }
  render() {
    //console.log('App render', this.state.startX);
    return (
      <div className='wrapper'>
          <header>
            <div className='heading'>Instorama</div>
            <DescText
              done={this.state.cropDone}
            />
          </header>
          <ImgInput
            img={this.state.img}
            onInput={e => this.handleInput(e.target)}
          />
          <ImgView
            imgData={this.state.imgData}
            imgWidth={this.state.imgWidth}
            imgHeight={this.state.imgHeight}
            startX={this.state.startX}
            cropDone={this.state.cropDone}
            onView={(boxCount, startX, maxX) => this.handleView(boxCount, startX, maxX)}
          />
          <ImgControls
            startX={this.state.startX}
            maxX={this.state.maxX}
            boxCount={this.state.boxCount}
            cropDone={this.state.cropDone}
            onStartX={e => this.handleStartX(e.target)}
            onCancel={() => this.handleCancel()}
            onFinish={() => this.handleFinish()}
          />
          <ImgResult
            img={this.state.img}
            imgHeight={this.state.imgHeight}
            startX={this.state.startX}
            boxCount={this.state.boxCount}
            cropDone={this.state.cropDone}
            onBack={() => this.handleBack()}
          />
      </div>
    );
  }
}

export default App;