import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  KeyboardAvoidingView,
  LayoutAnimation,
  StyleSheet,
  Dimensions,
  Alert,
  Text,
} from "react-native";
import { Image, View } from "react-native-animatable";
import imgLogo from "../assets/practitioner.png";
import Opening from "./auth_components/Opening";
import SignupForm from "./auth_components/SignupForm";
import LoginForm from "./auth_components/LoginForm";
import firebase from "firebase";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

class AuthPatient extends Component {
  state = {
    visibleForm: null, // Can be: null | SIGNUP | LOGIN
    loading: false,
    email: '',
    name: ''
  };

  onLoginPress(email, password) {
    this.setState({ loading: true });
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(this.onLoginSuccess.bind(this))
      .catch(() => {
          this.onLoginFail();
      });
  }

  onLoginFail() {
    this.setState({ error: "Authentication Failed", loading: false });
    Alert.alert("Login Failed", "Try Again!", [{ text: "OK" }], {
      cancelable: false
    });
    this.forceUpdate;
  }
  
  onBackPress(){
    this.props.navigation.navigate("AuthPatient")
  }


  onLoginSuccess( ) {
    if(firebase.database().ref("/Doctors/" + firebase.auth().currentUser.uid)==null){
      firebase.database().ref("/Doctors/" + firebase.auth().currentUser.uid + "/Account Details/")
      .set({
        'Clinic': 'null',
      })
      firebase.database().ref("/Doctors/" + firebase.auth().currentUser.uid + "/Patients/")
        .set('null') 
    }
    this.setState({ loading: false });
    this.props.navigation.navigate("BasePractitioner");
  }

  onCreateAccountSuccess( ) {
      firebase.database().ref("/Doctors/" + firebase.auth().currentUser.uid + "/Account Details/")
      .set({
        'name': this.state.name,
        'email': this.state.email
      })
      firebase.auth().currentUser.updateProfile({
        displayName: this.state.name
      })
    this.setState({ loading: false });
    this.props.navigation.navigate("BasePractitioner");
  }


  onSignupPress(email, confirmEmail, password, confirmPassword, name) {
    this.setState({ loading: true });

    if (email != confirmEmail) {
      Alert.alert("Emails Do Not Match", "Try Again!", [{ text: "OK" }], {
        cancelable: false
      });
    } else if (password != confirmPassword) {
      Alert.alert("Passwords Do Not Match", "Try Again!", [{ text: "OK" }], {
        cancelable: false
      });
    } else {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(this.onLoginSuccess.bind(this))
        .catch(() => {
          firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(this.setState({
              email: email,
              name: name
            }))
            .then(this.onCreateAccountSuccess.bind(this))
            .catch(this.onLoginFail.bind(this))
        });
    }
  }

  _hideAuthScreen = async () => {
    // 1. Slide out the form container
    await this._setVisibleForm(null);
    // 2. Fade out the logo
    await this.logoImgRef.fadeOut(800);
    // 3. Tell the container (app.js) that the animation has completed
    // this.props.onLoginAnimationCompleted()
  };

  _setVisibleForm = async visibleForm => {
    // console.log(this.formRef)
    // 1. Hide the current form (if any)
    if (this.state.visibleForm && this.formRef && this.formRef.hideForm) {
      await this.formRef.hideForm();
    }
    // 2. Configure a spring animation for the next step
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    // 3. Set the new visible form
    this.setState({ visibleForm });
  };

  render() {
    const { visibleForm } = this.state;
    // The following style is responsible of the "bounce-up from bottom" animation of the form
    const formStyle = !visibleForm ? { height: 0 } : { marginTop: 40 };

    console.disableYellowBox = true;

    return (
      // <ImageBackground
      //   source={require("../assets/auth_background2.png")}
      //   style={{ width: "100%", height: "100%", justifyContent: "flex-end" }}
      //   resizeMode="cover"
      // >
        <View style={styles.container}>
          <Image
            animation={"fadeIn"}
            duration={1200}
            delay={200}
            ref={ref => (this.logoImgRef = ref)}
            style={styles.logoImg}
            source={imgLogo}
          />
        <Image
            source={require('./frontPageLogo.png')}
                style={{ alignSelf: 'center', height: 50, width: 160 }}
        />
          {!visibleForm && (
            <Opening
              onCreateAccountPress={() => this._setVisibleForm("SIGNUP")}
              onSignInPress={() => this._setVisibleForm("LOGIN")}
              onHealthPractitionerPress={() => this.props.navigation.navigate("AuthPatient")}
              switchUserText={'Patient Login'}
            />
          )}
          <KeyboardAvoidingView
            keyboardVerticalOffset={-100}
            behavior={"padding"}
            style={[formStyle, styles.bottom]}
          >
            {visibleForm === "SIGNUP" && (
              <SignupForm
                ref={ref => (this.formRef = ref)}
                onLoginLinkPress={() => this._setVisibleForm("LOGIN")}
                onSignupPress={this.onSignupPress.bind(this)}
                isLoading={this.state.loading}
              />
            )}
            {visibleForm === "LOGIN" && (
              <LoginForm
                ref={ref => (this.formRef = ref)}
                onSignupLinkPress={() => this._setVisibleForm("SIGNUP")}
                onLoginPress={this.onLoginPress.bind(this)}
                isLoading={this.state.loading}
                onBackPressed={this.onBackPress.bind(this)}
                changeLoginText={'Patient Login'}
              />
            )}
          </KeyboardAvoidingView>
        </View>
      // </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    height: "100%",
    paddingTop: 24,
    backgroundColor: '#FFF'
  },
  logoImg: {
    flex: 1,
    height: null,
    width: WIDTH * 0.6,
    alignSelf: "center",
    resizeMode: "contain",
    marginVertical: 30
  },
  headerStyle: {
    color: '#8ae2ad',
    fontFamily: 'Comfortaa',
    fontWeight: 'bold',
    fontSize: 50,
    alignSelf: 'center'
  },
  bottom: {
    backgroundColor: "#8ae2ad"
  }
});

export default AuthPatient;
