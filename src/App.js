import React from 'react';
import './App.scss';

function Instructions(props) {
  let message = 'Adjust Photo Cropping';
  let theClass = 'instructions';
  if (!props.loaded) {
    theClass += ' hide';
  } else if (props.cropped) {
    message = 'Save Your Photos';
  }
  return (
    <div className={theClass}>
      <div className='msg'>{message}</div>
    </div>
  );
}

function ImgBrowse(props) {
  let display = null;
  if (!props.selected) {
    display = (
      <label>
        <div className='browse'>
          <input type='file' accept='image/*' onChange={props.onBrowse} />
          <div className='btn'>Select Your Photo</div>
        </div>
      </label>
    );
  } else if (!props.loaded) {
    display = (
      <div className='loading'>Loading Photo</div>
    );
  }
  return display;
}

function ImgView(props) {
  let display = null;
  if (props.width && props.height) {
    display = (
      <div className='view'>
        <img src={props.source} alt='Instorama' />
        <CropBoxes
          imgWidth={props.width}
          imgHeight={props.height}
          startX={props.startX}
          onView={props.onView}
        />
      </div>
    );
  }
  return display;
}

function ImgResult(props) {
  const results = [];
  const imgWidth = props.imgHeight;
  let cropX = props.startX;
  let theClass = 'result';
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
        <div className='counter'>{b + 1}</div>
      </li>
    );
  }
  //results.reverse();
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
      <div className='crop' style={this.state.boxesStyle}>
        <ul className='boxes'>
          {this.state.boxes}
        </ul>
      </div>
    );
  }
}

function ControlOption(props) {
  return (
    <li>
      <input
        type={props.type}
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={props.onControl}
      />
      <br />
      <span>{props.name}</span>
    </li>
  );
}

class ImgControls extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let theClass = 'controls';
    if (this.props.boxCount === 0 || this.props.cropDone) {
      theClass += ' hide';
    }
    return (
      <div className={theClass}>
        <ul className='options'>
          <ControlOption
            name={'Adjust Height'}
            type={'range'}
            min={0}
            max={0}
            value={0}
          />
          <ControlOption
            name={'Horizontal Position'}
            type={'range'}
            min={0}
            max={this.props.maxX}
            value={this.props.startX}
            onControl={this.props.onXPos}
          />
          <ControlOption
            name={'Vertical Position'}
            type={'range'}
            min={0}
            max={0}
            value={0}
          />
        </ul>
        <div className='confirm'>
          <button className='cancel' onClick={this.props.onCancel}>Cancel</button>
          <button className='finish' onClick={this.props.onFinish}>Finish</button>
        </div>
      </div>
    );
  }
}

class ImgCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.fileName = 'Instorama-' + this.props.num;
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
    //console.log(theLink);
  }
  render() {
    // <a target='_blank' download={this.fileName} onClick={() => this.handleClick()}>
    return (
      <canvas
        ref={this.canvasRef}
        width={this.props.width}
        height={this.props.height}
      >
      </canvas>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.year = new Date().getFullYear();
    this.state = {
      imgSelected: false,
      imgLoaded: false,
      imgCropped: false,
      imgInput: null,
      img: null,
      imgData: '',
      imgWidth: 0,
      imgHeight: 0,
      startX: 0,
      maxX: 0,
      boxWidth: 0,
      boxCount: 0
    }
  }
  handleBrowse(imgInput) {
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
          imgHeight: img.height,
          imgLoaded: true
        });
      };
      this.setState ({
        imgData: imgSrc
      });
    };
    this.setState({
      imgInput: imgInput,
      imgSelected: true
    });
    setTimeout(() => {
      fReader.readAsDataURL(imgFile);
    }, 500);
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
      imgSelected: false,
      imgLoaded: false,
      //imgCropped: false
    });
  }
  handleFinish() {
    if (this.state.boxCount > 0) {
      this.setState({
        imgCropped: true
      });
    }
  }
  handleBack() {
    this.setState({
      imgCropped: false
    });
  }
  render() {
    return (
      <div className='wrapper'>
        <div className='content'>
          <header className={this.state.imgSelected ? 'hide' : null}>
            <div className='logo'></div>
            <div className='heading'>
              <h1>Instorama</h1>
            </div>
            <div className='desc'>
              <h2>Crop a panorama into separate photos </h2>
              <h3>so they can be seemlessly swiped through on Instagram.</h3>
            </div>
          </header>
          <Instructions
            loaded={this.state.imgLoaded}
            cropped={this.state.imgCropped}
          />
          <div className={'photo' + (this.state.imgLoaded ? '' : ' place') + (this.state.imgCropped ? ' hide' : '')}>
            <ImgBrowse
              selected={this.state.imgSelected}
              loaded={this.state.imgLoaded}
              onBrowse={(e) => this.handleBrowse(e.target)}
            />
            <ImgView
              cropped={this.state.imgCropped}
              source={this.state.imgData}
              width={this.state.imgWidth}
              height={this.state.imgHeight}
              startX={this.state.startX}
              onView={(boxCount, startX, maxX) => this.handleView(boxCount, startX, maxX)}
            />
          </div>
          <ImgControls
            boxCount={this.state.boxCount}
            cropDone={this.state.imgCropped}

            startX={this.state.startX}
            maxX={this.state.maxX}
            onXPos={(e) => this.handleStartX(e.target)}
            onCancel={() => this.handleCancel()}
            onFinish={() => this.handleFinish()}
          />
          <ImgResult
            img={this.state.img}
            imgHeight={this.state.imgHeight}
            startX={this.state.startX}
            boxCount={this.state.boxCount}
            cropDone={this.state.imgCropped}
            onBack={() => this.handleBack()}
          />
        </div>
        <footer>
          <a href='http://maxsegale.com' target='_blank' rel='noopener'>
            <small>
              <span>Max Segale &copy; </span>
              <span>{this.year}</span>
            </small>
          </a>
        </footer>
      </div>
    );
  }
}

export default App;
