// import Accordion from 'react-native-collapsible/Accordion';
// import { CollapsingToolbar }  from 'react-native-collapsingtoolbar';
// import CollapsibleList from './collapsible_list.js'
import SkillPanel from './components/skill_panel.js'
import Buttons from './components/buttons';
// import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
// import ButtonsMachine from './interactions.js'
import {build_interactions_sm} from './interactions.js'
import {build_training_sm, problem_props} from './training_handler.js'
import NetworkLayer from './network_layer.js'
import { interpret } from 'xstate';
import autobind from 'class-autobind';
import path from 'path';
import pick from 'object.pick';
import Graph from './components/graph.js'

// 
import React, {useState, useEffect} from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
// import Loader from 'react-loader-spinner'
// import { View, Text, StyleSheet } from "react-native";
// import logo from './logo.svg';
// import './App.css';

import { TouchableHighlight,ScrollView,View, Text, Platform, StyleSheet,SectionList,AppRegistry, Linking } from "react-native";
import { style } from 'd3';

//index of current starting state in the starting state history
let startingStateCount = 0;

//uncertain data
var dataUncertain = {
  "certain": false,
  "nextID": 0,
  "startingNodeID" : -1,
  "endingNodeID" : -1,
  "currentNodeID" : -1,
  "nodes": [
  ],
  "links" : [
  ]
}

var dataCertain = {
  "certain": true,
  "nextID": 0,
  "startingNodeID" : -1,
  "endingNodeID" : -1,
  "currentNodeID" : -1,
  "nodes": [
  ],
  "links" : [
  ]
}

function createNode(name, id, show, data) {
  let newNode = {
    "name": name,
    "id": id,
    "show": show,
    "data": data
  }
  return newNode;
}

function createLink(source, target, skill, correct) {
  let newLink = {
    "source": source,
    "target": target,
    "skill": skill,
    "correct": correct
  }
  return newLink;
}

//add node and link to graph
function addToGraph(node, link, start = false, current = true, end = false, data) {

  if (start) {
    let startID = node.id;

    if (doesNodeExist(node, data.nodes)) {
      startID = getNodeIDWithSameContent(node, data.nodes);
      if (startID == undefined) startID = node.id;
    } else {
      data.nodes.push(node);
      data.nextID++;
    }

    data.startingNodeID = startID;
    
  } else if (!start && data.startingNodeID != -1){
    addNodeAndLinkToGraph(node, link, data);
  }
}

//helper function that adds node and link to data
function addNodeAndLinkToGraph(node, link, data) {
  let nodeIDWithSameContent = getNodeIDWithSameContent(node, data.nodes);
  let isOriginal = nodeIDWithSameContent == undefined;

  if (nodeIDWithSameContent == undefined) nodeIDWithSameContent = node.id;

  link.target = nodeIDWithSameContent;
  let sourceNode = getNodeWithID(link.source, data.nodes);
  let targetNode = getNodeWithID(link.target, data.nodes);

  if (targetNode == undefined) {
    targetNode = node;
  }

  let differences = numDifferences(sourceNode, targetNode);

  if (isOriginal && differences[0] != undefined) {
    data.nodes.push(node);
    data.nextID++;
  }
  
  if (!doesLinkExist(link, data.links) && differences[0] != undefined) {
    link["new"] = differences[0];
    data.links.push(link);

  } else if (doesLinkExist(link, data.links) && !data.certain) {
    let identicalLink = getIdenticalLink(link, data.links);
    if (!identicalLink.correct) {
      identicalLink.correct = link.correct;
    }
  }
}

//gets id of node with same content
function getNodeIDWithSameContent(node, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let compareNode = nodes[i];

    if (numDifferences(node, compareNode).length == 0) {
        return compareNode.id;
    }
  }
  return undefined;
}

//checks if node with same data exists already
function doesNodeExist(node, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let compareNode = nodes[i];
    let differences = numDifferences(node, compareNode);

    if (differences.length == 0) {
        return true;
    }
  }
  return false;
}

//checks if node with specific id exists
function getNodeWithID(id, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let compareNode = nodes[i];
    if (compareNode.id == id) {
        return compareNode;
    }
  }
  return undefined;
}

//checks if link already exists with same source + target
function doesLinkExist(link, links) {
  for (let i = 0; i < links.length; i++) {
  let compareLinks = links[i];
    if (isSameLink(link, compareLinks)) {
        return true;
    }
  }
  return false;
}

//returns the identical link if it exists
function getIdenticalLink(link, links) {
  for (let i = 0; i < links.length; i++) {
    let compareLinks = links[i];
      if (isSameLink(link, compareLinks)) {
          return compareLinks
      }
    }
    return undefined;
}


//returns the differences of two nodes
function numDifferences(node1, node2) {
  let differences = [];

  if (node1 != undefined && node2 != undefined) {
    Object.keys(node1.data).forEach(key => {
      if(node1.data[key].value != node2.data[key].value){
        //depends if you want to show the done or hint links
        // if (key != "done" && key != "hint") {
          differences.push(node2.data[key].id + ": " + node2.data[key].value);
        // }
      }
   });
  }
  
  return differences;
}

function isSameLink(link1, link2) {
  return link1.source == link2.source && link1.target == link2.target;
}



// const instructions = Platform.select({
//   ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
//   android:
//     "Double tap R on your keyboard to reload,\n" +
//     "Shake or press menu button for dev menu",
//   web: "Your browser will automatically refresh as soon as you save the file."
// });
// var state_machine = ButtonsMachine.initialState
// var state_machine_service = interpret(ButtonsMachine)
// state_machine_service.start()

// var NonInteractive_SM = build_SM_NonInteractive()
// var ctat_state_machine = NonInteractive_SM.initialState
// var ctat_state_machine_service = interpret(NonInteractive_SM)
// ctat_state_machine_service.start()
// window.ctat_state_machine = ctat_state_machine
// window.ctat_state_machine_service = ctat_state_machine_service

// var urlParams = new URLSearchParams(window.location.search);
// var AL_URL = urlParams.get('al_url');
// var HOST_URL = window.location.origins
// window.network_layer = new NetworkLayer(AL_URL,HOST_URL)

// ctat_state_machine_service.onTr

// ctat_state_machine_service.onTransition(current => {
//     setButtonsState(current,window.debugmode)
    
//     // this.setState({ current : current })
//     }
//   );
function shallow_diff(o1,o2,keys=null){
  console.log(keys)
  let diff = Object.keys(o2).reduce((diff, key) => {
      if (o1[key] !== o2[key] && (keys == null || keys.includes(key))){
        diff[key] = o2[key]
      }
      return diff
    }, {})
  return diff
}

export default class ALReactInterface extends React.Component {
  constructor(props){
    super(props);
    autobind(this);
    this.onInteractionTransition = this.onInteractionTransition.bind(this)
    // this.urlParams = new URLSearchParams(window.location.search);

    // this.AL_URL = this.urlParams.get('al_url');
    // this.HOST_URL = window.location.origin
    // console.log(this.AL_URL + '/create/',this.HOST_URL)

    this.network_layer = new NetworkLayer(props.AL_URL,props.HOST_URL,props.OUTER_LOOP_URL)
    
    // this.training_file = this.urlParams.get('training');
    // this.interactive = this.urlParams.get('interactive') == "true";
    // this.use_foci = this.urlParams.get('use_foci') == "true";

    // var working_dir = this.urlParams.get('wd')
    if(props.working_dir == null && props.training_file != null){
        var match = props.training_file.match(/(.*)[\/\\]/)
        props.working_dir =  !!match ? match[1] : ''; //The directory of the training.json
    }
    this.tutor = React.createRef()
    this.skill_panel = React.createRef()
    this.buttons = React.createRef()
    this.graphData = React.createRef()
    this.graphData = dataUncertain;
    this.graphdataCertain = React.createRef()
    this.graphdataCertain = dataCertain;
    this.toggle = false;

    this.state = {
      default_props: {},
      buttons_props: {app: this},
      tutor_props: this.props.tutor_props || {},
      skill_panel_props: {},
      "training_description" : "????",
      "agent_description" : "????",
      "problem_description" : "????",

      "interactive" : this.props.interactive,
      "free_author" : this.props.free_author,
      "tutor_mode" : this.props.tutor_mode,
    }
    // this.state = {prob_obj : null};
  };


  onInteractionTransition(current){
    console.log("#",current.value, ":", current.context, current)

    //check whether the current.value is a start state
    if (current.value == "Finalizing_Start_State") {
      let startingNodeCertain = createNode("State 0", dataCertain.nextID, true, current.context.app.tutor.current.start_state_history[startingStateCount])
      let startingNodeUncertain = createNode("State 0", dataUncertain.nextID, true, current.context.app.tutor.current.start_state_history[startingStateCount])
      startingStateCount++;

      addToGraph(startingNodeUncertain, null, true, true, false, dataUncertain);
      addToGraph(startingNodeCertain, null, true, true, false, dataCertain);

      let startNodeID = getNodeIDWithSameContent(startingNodeCertain, dataCertain.nodes);
      let startNodeIDUncertain = getNodeIDWithSameContent(startNodeIDUncertain, dataUncertain.nodes);
      dataUncertain.currentNodeID = startNodeIDUncertain;
      dataCertain.currentNodeID = startNodeID;

    } else if (current.value == "Querying_Apprentice" && current.context.state) {
      let currentState = current.context.state;

      if (currentState != undefined) {
        let newNode = createNode("State " + this.graphData.nextID, this.graphData.nextID, true, currentState)
        let newNodeCertain = createNode("State " + this.graphdataCertain.nextID, this.graphdataCertain.nextID, true, currentState)
        let newLink = createLink(this.graphData.currentNodeID, this.graphData.nextID, "", true);
        let newLinkCertain = createLink(this.graphdataCertain.currentNodeID, this.graphdataCertain.nextID, "", true);

        addToGraph(newNodeCertain, newLinkCertain, false, true, false, dataCertain);
        addToGraph(newNode, newLink, false, true, false, dataUncertain);

        let nodeID = getNodeIDWithSameContent(newNodeCertain, dataCertain.nodes);
        let nodeIDUncertain = getNodeIDWithSameContent(newNode, dataUncertain.nodes);

        dataUncertain.currentNodeID = nodeIDUncertain;
        dataCertain.currentNodeID = nodeID;
      }

    } else if (current.value["Waiting_User_Feedback"] == "Waiting_Yes_No_Feedback"){
      let AL_guesses = current.context.skill_applications

      if (AL_guesses != undefined) {
        for (let i = 0; i < AL_guesses.length; i++) {
          let guess = AL_guesses[i];
          let guessState = JSON.parse(JSON.stringify(current.context.state));
          guessState[guess.selection].value = guess.inputs.value;

          let nodeIDToAdd = this.graphData.nextID;

          let newNode = createNode("State " + nodeIDToAdd, nodeIDToAdd, true, guessState)
          let newLink = createLink(this.graphData.currentNodeID, nodeIDToAdd, "", false)

          addToGraph(newNode, newLink, false, true, false, dataUncertain);

          if (guess.action == "UpdateTextField") {

            let fakeContext = {...current.context};
            fakeContext.state = guessState;

            this.network_layer.queryApprentice(fakeContext).then(result => {
              if (result != null) {
                let nextSteps = result.responses
                for (let i = 0; i < nextSteps.length; i++) {
                  let response = nextSteps[i];
                  let guessStateCopy = JSON.parse(JSON.stringify(guessState));
                  guessStateCopy[response.selection].value = response.inputs.value;

                  let newNode2 = createNode("State " + this.graphData.nextID, this.graphData.nextID, true, guessStateCopy);
                  let newLink2 = createLink(nodeIDToAdd, this.graphData.nextID, "", false)

                  addToGraph(newNode2, newLink2, false, true, false, dataUncertain);
                } 
              }
            });
          }
        }
      }
    }


    var standard_props = {interactions_state: current,
                          interactions_service : this.interactions_service}
    this.setState({
      default_props : standard_props,
      "Interactions_Machine_State" : current.value
      // buttons_props: standard_props,
      // tutor_props: standard_props,
      // skill_panel_props: standard_props,
    })
  }

  onTrainingTransition(current){
    var c = current.context
    console.log("&", current)
    this.setState({"Training_Machine_State" : current.value})
    if(!c.interactive){
      this.setState({
        training_description : c.training_description || "???",
        agent_description : c.agent_description || "???",
        problem_description : c.problem_description || "???"
      })  
    }
  }

  changeInteractionMode(d){
    this.setState(d)
  }

  componentDidUpdate(prevProps,prevState){

    //Update from changeInteractionMode
    var d = shallow_diff(prevState,this.state,["interactive","free_author","tutor_mode"])
    if(Object.keys(d).length > 0){
      console.log("componentDidUpdate", d)
      this.training_service.send({
        type : "CHANGE_INTERACTION_MODE",
        data : d,
      })  
    }
  }

  componentDidMount(){
    console.log("MOUNTED")
    var tutor, nl, wd,tf
    [tutor, nl, wd,tf] = [this.tutor.current,this.network_layer,this.props.working_dir,this.props.training_file]

    // this.setState({
     
    // })
    this.interactions_sm = build_interactions_sm(this,
                                                 pick(this.props,problem_props))
                                                 // this.props.interactive,
                                                 // this.props.free_author,
                                                 // this.props.tutor_mode)  
    this.interactions_service = null //Will be spawned in training_sm 

    this.training_machine = build_training_sm(this,this.interactions_sm, tf, wd)
    this.training_service = interpret(this.training_machine)
    this.training_service.onTransition(this.onTrainingTransition)
    this.training_service.start()

    const sub = this.training_service.subscribe(state => {
      console.log("SUBSCRIBE:",state);
    });
    console.log("T MACHINE!", this.training_service)

    window.setTutorMode = (x) => {
      this.changeInteractionMode({"tutor_mode" : x})
    }

    window.setInteractive = (x) => {
      this.changeInteractionMode({"interactive" : x})
    }

    window.setFreeAuthor = (x) => {
      this.changeInteractionMode({"free_author" : x})
    }

    //TODO MOVE TO NW_LAYER
    window.generateBehaviorProfile = this.generateBehaviorProfile


  }

  generateBehaviorProfile(ground_truth_path="/al_train/ground_truth.json",out_dir=""){
    // window.generateBehaviorProfile = (ground_truth_path,out_dir="") => {
    let f = this.network_layer.generateBehaviorProfile

    let t_context = this.training_service._state.context
    // let i_context = this.training_service.context
    if(ground_truth_path != null){

      let to_json_list = (in_list) => {
        let out = []
        for (let line of in_list){
          if(line != ""){
            let json = JSON.parse(line)
            out.push(json)
          }
        }
        return out;
      }
      // let rq_h = this.network_layer.return
      // let path =  ground_truth_path
      if(ground_truth_path[0] != "/"){
        ground_truth_path = (t_context.working_dir|| "/") + ground_truth_path
      }
      return fetch(ground_truth_path)
        .then((resp) => resp.text())
        .then((text) => text.split("\n"))
        .then((split) => to_json_list(split))
        .then((resps) => f(t_context,{data:{requests:resps,out_dir: out_dir}}))

    }else{
      return f(t_context)  
    }
      
  }

  render(){
    const Tutor = this.props.tutorClass

    var lower_display;
    var use_prompt = false
    if(!this.state.interactive){
      use_prompt = true
      var prompt_text
      // if(this.state.tutor_mode == true){
      //   prompt_text = "TUTOR MODE\n"
      // }else if(!this.state.interactive){
      prompt_text = 
        this.state.training_description + "\n" +
        this.state.agent_description + "\n" +
        this.state.problem_description + "\n"

      lower_display = 
      <View style={styles.prompt}>
        <Text>
        {prompt_text}
        </Text>
      </View>
    }else{
      lower_display = 
        <View style={styles.controls}>
          {!this.state.tutor_mode &&
          <View style={styles.skill_panel}>
            <SkillPanel ref={this.skill_panel}
            {...this.state.default_props}
            {...this.state.skill_panel_props}/>
          </View>
          }
          <View style={styles.buttons}>
            <Buttons ref={this.buttons}
            {...this.state.default_props}
            {...this.state.buttons_props}
            {...{tutor_mode: this.state.tutor_mode}}/>
          </View>
        </View>
    }
    
    // <View style={styles.overlay}>
        //   <Text style={styles.overlay_text}>
        //     LOADING
        //   </Text>
        // </View>
    console.log("TRANING MACHINE STATE",this.state.Training_Machine_State)
    return (
      //whole view
      <View style={styles.container}>
  		  <View style={styles.ctat_tutor}>
          {(this.state.Training_Machine_State == "Creating_Agent") //||
            // this.state.Interactions_Machine_State == "Querying_Apprentice" ||
            // this.state.Interactions_Machine_State == "Sending_Feedback")
            &&
            <View style={styles.overlay}>
              <Spinner
                color={'#000000'}
                size={150}
                visible={true}
                textContent={'Loading...'}
                textStyle={styles.spinnerTextStyle}
              />
            </View>
          }
          {/* <Graph graph = {this.graphdataCertain}/> */}
          <Graph graph = {this.graphData}/>
          <Tutor
            //tutor_props = {this.state.prob_obj}
            ref={this.tutor}//{function(tutor) {window.tutor = tutor; console.log("TUTOR IS:",tutor)}}
            id="tutor_iframe"
            // current_state={ctat_state_machine}
            //sm_service={ctat_state_machine_service}
            {...this.state.default_props}
            {...this.state.tutor_props}
          />
        </View>
  		  {lower_display}
  	  </View>
    );
  }
}

//current={state_machine}
//service={state_machine_service}
//debugmode={true}
//callbacks={window.button_callbacks}
//nools_callback={window.nools_callback}/>

const styles = StyleSheet.create({
      spinnerTextStyle: {
        color: '#000000'
      },
      overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(50, 50, 50, 0.3)',
        flex: "100%",
        justifyContent: "center",
        alignItems: "center"
      },
      overlay_text: {
        textAlign: 'center',
      },
	     container : {
        // flex : 0,
        height : "100%",
        width : "100%",
        display : "flex",
        alignItems : 'stretch',
        overflow: "hidden",
        // justifyContent: "stretch",
        // padding: 20,
        // alignItems:'stretch',
        // backgroundColor: "blue",
        // flex: "100%",
        flexGrow: 1,
        // flex:100,
        flexDirection: "column",
        // flexWrap: "wrap"
      },
      ctat_tutor: {

      	// backgroundColor: 'powderblue',
      	
      	// flexGrow: 1,
      	// height : "65%",
      	// width : "100%",
        // width:800,
        // height: vh(64),
        // flexGrow: 100,
        flex: 65,
        margin: 4,
        flexDirection: "row"
        // flex: 1,
        // flexBasis: 65,
      },
      prompt : {
        flex: 35,
        textAlign : "center"
      },
      controls :{

      	// flexGrow: 1,
      	// flexBasis: 300,
        // display: "flex",
        maxHeight : "35%",
        flex: 35,
        // flexBasis: .35,
        flexDirection: "row",
        alignItems: "stretch",

        // flexWrap: "wrap",
        // width : 600,
        // flexGrow: 1,
        // flexBasis:  600,
        // height: vh(35),
        // justifyContent: "center",
      },
      
      skill_panel : {
      	// width: "65%",
      	// height: 300,
        // height: vh(35),
        flex : 60,
        // flexBasis: .60,
        // flexGrow : 0
        // flexDirection: "row",
        // flexShrink: 1,
        // flexBasis: 1
        /*height: 320px*/

      },
      

      buttons : {
        // flexGrow: 1,
        // display: "flex",
        // width : 1000,
        // flexBasis: 2,
        flex : 40,
        flexDirection: "column",
        // height: vh(35),
        // width: "35%",
        // flexBasis : .40,
        // flexBasis : 40,
        // flexShrink : 0 0 "40%",
        
        /*width:300px;*/
        // flexWrap: "wrap",
        justifySelf : "space-around",
        
        // flexBasis: 32,
        /*justify-self:  start;*/
        /*align-self:  ;*/
        /*padding: 60px,*/
        // justifyContent: "auto",
        
        // alignContent: "center"
        
      }

});