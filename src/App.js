import React from 'react';
import logo from './logo.svg';
import './App.css';

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
  let display = null;
  if (props.imgWidth && props.imgHeight) {
    display = (
      <div className="pano">
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
        <div className="text">No Photo Selected</div>
      </div>
    );
  }
  return <div className='img_view'>{display}</div>;
}

function ImgResult(props) {
  const results = [];
  const imgWidth = props.imgHeight;
  let cropX = props.startX;
  if (!props.cropDone) {
    return null;
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
  return <ul className='img_result'>{results}</ul>;
}

class CropBoxes extends React.Component {
  constructor(props) {
    super(props);
    //this.boxCount = Math.floor(this.props.imgWidth / this.props.imgHeight);
    //this.widthRem = this.props.imgWidth - (this.boxCount * this.props.imgHeight);
    //this.widthRemPct = this.widthRem * 100 / this.props.imgWidth;
    //this.widthPct = 100 - this.widthRemPct;
    //this.styleObj = {
    //  width: this.widthPct + '%',
      //left: (this.widthRemPct / 2) + '%'
    //  left: this.props.startX + '%'
    //};
    this.state = {
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
      boxes: boxes,
      boxesStyle: {
        width: widthPct + '%',
        //left: (widthRemPct / 2) + '%'
      }
    });
  }
  componentDidUpdate(prevProps) {
    let startXPct = 0;
    if (this.props.startX !== prevProps.startX) {
      startXPct = this.props.startX * 100 / this.props.imgWidth;
      this.setState({
        boxesStyle: {
          width: this.widthPct + '%',
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
    if (this.props.boxCount === 0) {
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
            value={this.state.x}
            onChange={this.handleChange}
          />
          <br />
          <span>Adjust cropping</span>
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
    //console.log('handleView', startX);
    this.setState({
      boxCount: boxCount,
      //startX: startX,
      maxX: maxX
    });
  }
  handleStartX(input) {
    //console.log('handleStartX', input.value, this.state.startX, this.state.maxX);
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
  render() {
    //console.log('App render', this.state.startX);
    return (
      <div className='wrapper'>
        <header>
          <h1 className='heading'>Instorama</h1>
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
          onView={(boxCount, startX, maxX) => this.handleView(boxCount, startX, maxX)}
        />
        <ImgControls
          startX={this.state.startX}
          maxX={this.state.maxX}
          boxCount={this.state.boxCount}
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
        />
      </div>
    );
  }
}

export default App;