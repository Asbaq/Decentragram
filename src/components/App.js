import React, { Component } from 'react';
import Web3 from 'web3';
//import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'

const ipfsClient = require('ipfs-http-client')
const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocal: 'https'})


class App extends Component {

  async componentWillMount()
  {
    await this.loadWeb3()
    await this.loadBlockchaininData()
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await 'eth_requestAccounts RPC'
    }
    else if(window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Etherum detected. You should consider trying Metamask!')
    }
  }

  async loadBlockchaininData() {
    const web3 = window.web3
    //load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    //Network ID
    const networkID = await web3.eth.net.getId()
    const networkData = Decentragram.networks[networkID]
    if(networkData)
    {
    const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
    this.setState({ decentragram })
    const imagesCount = await decentragram.methods.imageCount().call()
    this.setState({ imagesCount })

    //load images
      for (var i=1; i<= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }

  //    sort images. Show highest tipped images first
      this.setState({
      images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount)
    })
    

    this.setState({loading: false})
    }
    else
    {
      window.alert('Decentragram contract not deployed to detected network.')
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result)})
      console.log('buffer', this.state.buffer)
    }
  }

  uploadImage = description => {
    console.log("submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
     console.log('Ipfs result: ', result)
      if(error) {
      console.error("error:", error)
      return
      }
    
    // this.setState({loading:true})
    
    const tx = this.state.decentragram.methods.uploadImage(result[0].hash, description);
    console.log("tx = ", tx)
    // this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transcationHash', (hash) => {
    // this.setState({ loading: false})
    const receipt = this.state.decentragram.methods.uploadImage(result[0].hash, description);
      console.log("receipt = ", receipt)
    })
  //})
  }

  tipImageOwner = (id, tipAmount) => {
    this.setState({ loading: true})
    this.state.decentragram.methods.tipImageOwner(id).send({ from:this.state.account, value: tipAmount}).on('transactionHash', (hash) =>{
    this.setState({ loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      images:[],
      loading: true
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            images={this.state.images}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
            />
          }
      </div>
    );
  }
}

export default App;  