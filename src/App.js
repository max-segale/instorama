import React from 'react';
import logo from './icons/logo.svg';
import './App.scss';

// Document header
function Header(props) {
  if (props.show) {
    return (
      <header>
        <div className='heading'>
          <h1>Instorama</h1>
        </div>
        <div className='logo'>
          <img src={logo} alt='Instorama logo' />
        </div>
        <div className='desc'>
          <h2>Crop a panorama into separate photos </h2>
          <h3>so they can be seemlessly swiped through on Instagram.</h3>
        </div>
      </header>
    );
  }
  return null;
}

// Change instructions based on step in process
function Instructions(props) {
  let message = 'Adjust Photo Cropping';
  if (props.loaded || props.cropped) {
    if (props.cropped) {
      message = 'Save Your Photos';
    }
    return (
      <div className='instructions'>{message}</div>
    );
  }
  return null;
}

// File input removed after selection
function ImgBrowse(props) {
  if (props.show) {
    return (
      <label>
        <div className='browse'>
          <input type='file' accept='image/*' onChange={props.onBrowse} />
          <div className='btn'>Select Photo</div>
          <div className='guide'>Browse your photo library for panoramas</div>
        </div>
      </label>
    );
  }
  return null;
}

// Loading message removed after image loads
function ImgLoading(props) {
  if (props.show) {
    return (
      <div className='loading'>Loading Photo</div>
    );
  }
  return null;
}

// Display chosen photo
function ImgView(props) {
  if (props.show) {
    return (
      <img className='view' src={props.source} alt='Instorama' />
    );
  }
  return null;
}

// Overlay to preview new images
function ImgBoxes(props) {
  const totalWidth = props.boxCount * props.boxWidth;
  const totalWidthPct = totalWidth * 100 / props.fullWidth;
  const heightPct = props.boxHeight * 100 / props.fullHeight;
  const leftPct = props.boxLeft * 100 / props.fullWidth;
  const topPct = props.boxTop * 100 / props.fullHeight;
  const boxes = [];
  let divider = null;
  if (props.show) {
    for (let b = 0; b < props.boxCount; b += 1) {
      if (b > 0) {
        divider = <div className='divider'></div>;
      }
      boxes.push(
        <li key={b}>
          {divider}
        </li>
      );
    }
    return (
      <div className='crop' style={
        {
          width: `${totalWidthPct}%`,
          height: `${heightPct}%`,
          left: `${leftPct}%`,
          top: `${topPct}%`
        }
      }>
        <ul className='boxes'>
          {boxes}
        </ul>
      </div>
    );
  }
  return null;
}

// Input to adjust crop position
function RangeInput(props) {
  let disable = false;
  if (props.minVal >= props.maxVal) {
    disable = true;
  }
  return (
    <li>
      <label>
        <input
          type='range'
          min={props.minVal}
          max={props.maxVal}
          defaultValue={props.defaultVal}
          onChange={props.onControl}
          disabled={disable}
        />
        <span>{props.name}</span>
      </label>
    </li>
  );
}

// Input to adjust number of images
function NumberBtn(props) {
  let disable = false;
  if ((props.name === 'plus' && (props.boxCount >= props.limit || props.boxCount >= 10)) ||
      (props.name === 'minus' && props.boxCount <= props.limit)) {
    disable = true;
  }
  return (
    <button className={props.name} disabled={disable} onClick={props.onPress}></button>
  );
}

// Set image cropping
function ImgControls(props) {
  if (props.show) {
    return (
      <div className='controls'>
        <ul className='options'>
          <RangeInput
            name={'Height'}
            minVal={props.minHeight / 2}
            maxVal={props.maxHeight}
            defaultVal={props.maxHeight}
            onControl={props.onCropHeight}
          />
          <RangeInput
            name={'Horizontal'}
            minVal={0}
            maxVal={props.maxHori}
            defaultVal={props.startHori}
            onControl={props.onXPos}
          />
          <RangeInput
            name={'Vertical'}
            minVal={0}
            maxVal={props.maxVert}
            defaultVal={props.startVert}
            onControl={props.onYPos}
          />
        </ul>
        <div className='confirm'>
          <button className='cancel' onClick={props.onCancel}>Cancel</button>
          <div className='number'>
            <NumberBtn
              name='minus'
              boxCount={props.boxCount}
              onPress={props.onBoxMinus}
              limit={2}
            />
            <div className='text'>
              {props.boxCount} Images
            </div>
            <NumberBtn
              name='plus'
              boxCount={props.boxCount}
              onPress={props.onBoxPlus}
              limit={props.boxCountMax}
            />
          </div>
          <button className='finish' onClick={props.onFinish}>Finish</button>
        </div>
      </div>
    );
  }
  return null;
}

// New cropped image from canvas
class ImgBlock extends React.Component {
  constructor(props) {
    super(props);
    this.imgRef = React.createRef();
    this.imgCanvas = document.createElement('canvas');
    this.imgCanvas.width = this.props.width;
    this.imgCanvas.height = this.props.height;
    this.imgName = 'Instorama-' + this.props.num;
    this.state = {
      context: null
    }
  }
  componentDidMount() {
    const ctx = this.imgCanvas.getContext('2d');
    this.setState ({
      context: ctx
    });
  }
  componentDidUpdate() {
    const imgX = this.props.cropX * -1;
    const imgY = this.props.cropY * -1;
    let imgURL = null;
    if (this.props.img) {
      this.state.context.drawImage(this.props.img, imgX, imgY);
      imgURL = this.imgCanvas.toDataURL(this.props.type);
      this.imgRef.current.src = imgURL;
    }
  }
  render() {
    return (
      <img ref={this.imgRef} alt={this.imgName} />
    );
  }
}

// New image results
function ImgResults(props) {
  const results = [];
  let cropX = props.xPos;
  if (props.show) {
    for (let b = 0; b < props.boxCount; b += 1) {
      if (b > 0) {
        cropX += props.imgWidth;
      }
      results.push(
        <li key={b}>
          <ImgBlock
            num={b + 1}
            img={props.imgElement}
            width={props.imgWidth}
            height={props.imgHeight}
            cropX={cropX}
            cropY={props.yPos}
            type={props.imgType}
          />
          <div className='counter'>{props.boxCount - b}</div>
        </li>
      );
    }
    return (
      <div className='result'>
        <ul>
          {results}
        </ul>
        <button className='back' onClick={props.onBack}>Back</button>
      </div>
    );
  }
  return null;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.year = new Date().getFullYear();
    this.state = {
      imgSelected: false,
      imgLoaded: false,
      imgCropped: false,
      img: null,
      imgData: null,
      fileType: null,
      imgWidth: 0,
      imgHeight: 0,
      boxCount: 0,
      boxCountMax: 0,
      cropWidth: 0,
      cropHeight: 0,
      maxHeight: 0,
      startX: 0,
      maxX: 0,
      startY: 0,
      maxY: 0
    }
  }

  // Image loaded
  handleImgLoad(img) {
    // How many boxes can fit in the image
    const initBoxCount = Math.floor(img.width / img.height);
    // How much space will be left over
    const widthRem = img.width - (initBoxCount * img.height);
    this.setState({
      img: img,
      imgWidth: img.width,
      imgHeight: img.height,
      imgLoaded: true,
      boxCount: initBoxCount,
      boxCountMax: initBoxCount,
      startX: widthRem / 2,
      maxX: widthRem,
      maxHeight: img.height,
      cropWidth: (img.width - widthRem) / initBoxCount,
      cropHeight: img.height
    });
  }

  // Image read
  handleImgRead(result) {
    const img = new Image();
    const imgSrc = result;
    img.src = imgSrc;
    img.onload = () => this.handleImgLoad(img);
    this.setState ({
      imgData: imgSrc
    });
  }

  // Image selected
  handleImgSelect(imgInput) {
    const imgFile = imgInput.files[0];
    const fReader = new FileReader();
    fReader.onload = () => this.handleImgRead(fReader.result);
    fReader.readAsDataURL(imgFile);
    this.setState({
      imgSelected: true,
      fileType: imgFile.type
    });
  }

  // Set height of crop boxes
  handleCropHeight(input) {
    const newHeight = Number(input.value);
    const newWidth = newHeight;
    // Set new max x pos
    const newMaxX = this.state.imgWidth - (this.state.boxCount * newHeight);
    // Set new max box count
    const newMaxBoxCount = Math.floor(this.state.imgWidth / newHeight);
    // Make sure crop area isn't growing off right edge
    if (this.state.startX > newMaxX) {
      this.setState({
        startX: newMaxX
      });
    }
    // Make sure crop area isn't going off the bottom
    if ((newHeight + this.state.startY) > this.state.imgHeight) {
      this.setState({
        startY: this.state.imgHeight - newHeight
      });
    }
    this.setState({
      boxCountMax: newMaxBoxCount,
      cropWidth: newWidth,
      cropHeight: newHeight,
      maxX: newMaxX,
      maxY: this.state.imgHeight - newHeight
    });
  }

  // Update cropping X position
  handleStartX(input) {
    this.setState({
      startX: Number(input.value)
    });
  }

  // Update cropping X position
  handleStartY(input) {
    this.setState({
      startY: Number(input.value)
    });
  }

  // Set max box height so the row doesn't extend off the right edge
  adjustMaxHeight() {
    const panoRatio = this.state.imgWidth / this.state.imgHeight;
    const cropRatio = (this.state.boxCount * this.state.cropWidth) / this.state.cropHeight;
    let newMaxHeight = panoRatio * this.state.imgHeight / cropRatio;
    // Make sure new height isn't greater than image height
    if (newMaxHeight > this.state.imgHeight) {
      newMaxHeight = this.state.imgHeight;
    }
    this.setState({
      maxHeight: newMaxHeight
    });
  }

  // Reduce number of cropped images
  handleBoxMinus() {
    const boxNum = this.state.boxCount -= 1;
    const newMaxX = this.state.imgWidth - (boxNum * this.state.cropHeight);
    // check max crop height
    this.adjustMaxHeight();
    // Set new box count and max x
    this.setState({
      boxCount: boxNum,
      maxX: newMaxX
    });
  }

  // Increase number of cropped images
  handleBoxPlus() {
    const boxNum = this.state.boxCount += 1;
    const newMaxX = this.state.imgWidth - (boxNum * this.state.cropHeight);
    // check max crop height
    this.adjustMaxHeight();
    // Make sure new box isn't placed off right edge edge
    if (this.state.startX > newMaxX) {
      this.setState({
        startX: newMaxX
      });
    }
    // Set new box count and max x
    this.setState({
      boxCount: boxNum,
      maxX: newMaxX
    });
  }

  // Return to image selection
  handleCancel() {
    this.setState({
      img: null,
      imgWidth: 0,
      imgHeight: 0,
      boxCount: 0,
      imgSelected: false,
      imgLoaded: false
    });
  }

  // Show new images
  handleFinish() {
    this.setState({
      imgCropped: true
    });
  }

  // Return to cropping controls
  handleBack() {
    this.setState({
      imgCropped: false
    });
  }

  render() {
    return (
      <div className='wrapper'>
        <div className='content'>
          <Header
            show={!this.state.imgSelected}
          />
          <Instructions
            loaded={this.state.imgLoaded}
            cropped={this.state.imgCropped}
          />
          <div className={'photo' + (this.state.imgLoaded ? '' : ' place')}>
            <ImgBrowse
              show={!this.state.imgSelected}
              onBrowse={(e) => this.handleImgSelect(e.target)}
            />
            <ImgLoading
              show={this.state.imgSelected && !this.state.imgLoaded}
            />
            <ImgView
              show={this.state.imgLoaded && !this.state.imgCropped}
              source={this.state.imgData}
            />
            <ImgBoxes
              show={this.state.imgLoaded && !this.state.imgCropped}
              fullWidth={this.state.imgWidth}
              fullHeight={this.state.imgHeight}
              boxCount={this.state.boxCount}
              boxWidth={this.state.cropWidth}
              boxHeight={this.state.cropHeight}
              boxLeft={this.state.startX}
              boxTop={this.state.startY}
            />
          </div>
          <ImgControls
            show={this.state.imgLoaded && !this.state.imgCropped}
            boxCount={this.state.boxCount}
            boxCountMax={this.state.boxCountMax}
            minHeight={this.state.imgHeight}
            maxHeight={this.state.maxHeight}
            startHori={this.state.startX}
            maxHori={this.state.maxX}
            startVert={this.state.startY}
            maxVert={this.state.maxY}
            onCropHeight={(e) => this.handleCropHeight(e.target)}
            onXPos={(e) => this.handleStartX(e.target)}
            onYPos={(e) => this.handleStartY(e.target)}
            onBoxMinus={() => this.handleBoxMinus()}
            onBoxPlus={() => this.handleBoxPlus()}
            onCancel={() => this.handleCancel()}
            onFinish={() => this.handleFinish()}
          />
          <ImgResults
            show={this.state.imgCropped}
            imgElement={this.state.img}
            imgType={this.state.fileType}
            boxCount={this.state.boxCount}
            xPos={this.state.startX}
            yPos={this.state.startY}
            imgWidth={this.state.cropWidth}
            imgHeight={this.state.cropHeight}
            onBack={() => this.handleBack()}
          />
        </div>
        <footer>
          <span>Built by </span>
          <a href='https://maxsegale.com' target='_blank' rel='noopener noreferrer'>
            <span>Max Segale</span>
          </a>
          <br />
          <span>Instorama does not collect any data or photos</span>
        </footer>
      </div>
    );
  }
}

export default App;
