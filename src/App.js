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

function ImgControls(props) {
  let theClass = 'img_controls';
  if (props.boxCount === 0) {
    theClass += ' hide';
  }
  return (
    <div className={theClass}>
      <button className='cancel' onClick={props.onCancel}>Cancel</button>
      <div>
        <input type='range' min='0' max='100' onChange={props.onStartX} />
        <br />
        <span>Adjust cropping</span>
      </div>
      <button className='finish' onClick={props.onFinish}>Finish</button>
    </div>
  );
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
          draggable='true'
          onDragStart={e => this.handleDrag(e, true)}
          onDrag={e => this.handleDrag(e, true)}
          onDragEnd={e => this.handleDrag(e, false)}
        >
          {divider}
        </li>
      );
    }
    this.props.onView(boxCount, startX);
    this.setState({
      boxes: boxes,
      boxesStyle: {
        width: widthPct + '%',
        left: (widthRemPct / 2) + '%'
      }
    });
  }
  componentDidUpdate() {
    //console.log(this.state);
  }
  handleDrag(e, dragging) {
    console.log('DRAG', dragging);
  }
  render() {
    return (
      <ul className='boxes' style={this.state.boxesStyle}>
        {this.state.boxes}
      </ul>
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
  handleView(boxCount, startX) {
    this.setState({
      boxCount: boxCount,
      startX: startX
    });
  }
  handleCancel() {
    this.state.imgInput.value = '';
    this.setState({
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
    return (
      <div className='wrapper'>
        <header>
          <h1 className='heading'>Instorama</h1>
          <h2>
            <span>Crop a panorama photo</span> <span>into insta-ready tiles.</span>
          </h2>
        </header>
        <ImgInput
          img={this.state.img}
          onInput={e => this.handleInput(e.target)}
        />
        <ImgView
          imgData={this.state.imgData}
          imgWidth={this.state.imgWidth}
          imgHeight={this.state.imgHeight}
          onView={(boxCount, startX) => this.handleView(boxCount, startX)}
        />
        <ImgControls
          boxCount={this.state.boxCount}
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
