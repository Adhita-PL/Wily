import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, Alert} from 'react-native';
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import { TextInput } from 'react-native-gesture-handler';
import * as firebase from 'firebase';
import db from '../Config';

export default class TransactionScreen extends React.Component{
    constructor() {
        super();
        this.state  = {
            hasCameraPermissions: null,
            scanned: false,
            buttonState: 'normal',
            scannedBookId: '',
            scannedStudentId: '',
        }
    }
    getCameraPermissions = async(id) => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: id,
            scanned: false
        })
    }
    handleBarcodeScanned = async({type,data}) => {
        const {buttonState} = this.state
        if(buttonState === "BookId") {
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal',
            })
        }
        else if(buttonState === "StudentId") {
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal',
            })
        }
    }
    initiateBookIssue = async () =>{
        db.collection("transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'transactionType' : "Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability' : false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert("Book Issued");
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }
    initiateBookReturn = async () =>{
        db.collection("transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'transactionType' : "Return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability' : true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert("Book Returned");
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }
    handleTransaction = async () =>{
        var transactionMessage
        db.collection("books").doc(this.state.scannedBookId).get() 
        .then((doc)=>{
            var book = doc.data();
            if(book.bookAvailability) {
                this.initiateBookIssue();
                transactionMessage = "Book issued"
            }
            else{
                this.initiateBookReturn();
                transactionMessage = "book returned"
            }
        })
        this.setState({
            transactionMessage: transactionMessage
        })
    }
    render() {
        const hasCameraPermissions = this.state.hasCameraPermissions
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState !== "normal" && hasCameraPermissions) {
            return(
                <BarCodeScanner
                onBarCodeScanned = {scanned?undefined:this.handleBarcodeScanned}
                style = {StyleSheet.absoluteFillObject} /> 
            )
        } else if(buttonState === "normal") {
            return(
                <View style = {styles.container}>
                    <View>
                        <Image 
                        source = {require("../assets/booklogo.jpg")}
                        style = {{width:200, height:200}}  />
                        <Text style = {{textAlign: 'center', fontSize: 30,}}>Wily</Text>
                    </View>
                    <View style = {styles.inputView}> 
                        <TextInput style = {styles.inputBox}
                            placeholder = "Book ID" 
                            value = {this.state.scannedBookId} />
                        <TouchableOpacity style = {styles.scanButton} 
                        onPress = {()=>{
                            this.getCameraPermissions('BookId')
                        }}>
                            <Text style = {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.inputView}> 
                        <TextInput style = {styles.inputBox}
                            placeholder = "Student ID" 
                            value = {this.state.scannedStudentId} />
                        <TouchableOpacity style = {styles.scanButton}
                        onPress = {()=>{
                            this.getCameraPermissions('StudentId')
                        }}>
                            <Text style = {styles.buttonText}>Scan</Text> 
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style = {styles.submitButton}
                    onPress = {async()=>{
                        var transactionMessage = await this.handleTransaction()}} >
                        <Text style = {styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor: '#FBC02D',
        width: 100,
        height:50,
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight: 'bold',
        color:'white',
    }
  });
