import React from 'react';
import {  
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  Image,
  Text,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';

const API_KEY = 'API_KEY';
const API_STEM = 'API_URL';

var DOMParser = require('xmldom').DOMParser;

export default class SettingsScreen extends React.Component {
  
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      areaArray: [], 
      params: props.navigation.state.params.hi.code,
    };    
  }

  async componentDidMount() {    
    // var date = dow!="Monday" ? moment().subtract(1, 'days').format('YYYYMMDD') : moment().subtract(3, 'days').format('YYYYMMDD');    
    var tempArray = [];
    var prdlst_cd = this.state.params;    
    //Have a try and catch block for catching errors.
    try {
      await fetch(`API_URL`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: prdlst_cd,          
        })
      })
      .then(response => response.text())
      .then(data => {
        eval(data).forEach((el, idx) => {
          // console.log(el.item_code)
          var placeArrayElement = {
            place: el.area_name,
            marketName: el.market_name,
            price: el.price,
            pricePer: el.unit,
          }
          tempArray.push(placeArrayElement);
        })
      })            
      this.setState({areaArray: tempArray, loading: false,});
    } catch(err) {
        console.log("Error fetching data-----------", err);
    }
  }

  render() {
    const { navigation } = this.props;
    const { loading, } = this.state;
    if(!loading) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView style={{width: Dimensions.get('window').width, flex: 1,}}>
            <View style={{width: Dimensions.get('window').width, flex: 1, alignItems: 'flex-end'}}>
              <TouchableOpacity                           
                onPress={() => {
                  navigation.goBack();
                }}>
                  <View style={{
                    width: 40, 
                    height: 40,
                    marginTop: 10,
                    marginRight: 10,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'}}>
                    <Image
                      style={{width: 20, height: 20}}
                      source={require('../assets/images/e2.png')}
                    />
                  </View>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 20, flex: 1, alignItems: 'center', justifyContent: 'center',}}>
              <ImageBackground source={require("../assets/images/f1.png")} resizeMode="cover" imageStyle={{ borderRadius: 8 }} style={styles.listItemHeader}>
                <Text style={styles.listItemHeaderTextLeft}>지역</Text>
                <Text style={styles.listItemHeaderTextRight}>가격</Text>
              </ImageBackground>           
            </View>
            {
            this.state.areaArray.map(( item, key ) =>
              (               
                <View key={key} style={{marginTop: 10, flex: 1, alignItems: 'center', justifyContent: 'center',}}>
                  <View style={styles.listItem}>
                    <Text style={styles.listItemTextLeft}>{item.place}{"\n"}({item.marketName})</Text>
                    {
                      item.price != 0
                      ? <Text style={styles.listItemTextRight}>{item.price}원/{item.pricePer}</Text>
                      : <Text style={styles.listItemTextRight}>가격정보없음</Text>
                    }                      
                  </View>
                </View>
              ))
            }
            <View style={{height: 50,}}></View>
          </ScrollView>    
        </SafeAreaView>      
      );
    } else {
      return (
        <SafeAreaView style={styles.container}>
          <ActivityIndicator />
        </SafeAreaView>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemHeader: {
    flexDirection: 'row',
    width: Dimensions.get('window').width*0.8,
    height: 50,
    alignItems: 'center',
  },
  listItemHeaderTextLeft: {
    flex: 3,
    color: 'white',
    fontFamily: 'suncheon',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'white',
  },
  listItemHeaderTextRight: {
    flex: 7,
    color: 'white',
    fontFamily: 'suncheon',
    textAlign: 'center'
  },
  listItem: {
    flexDirection: 'row',
    width: Dimensions.get('window').width*0.8,    
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2FA763',        
    padding: 10,
  },
  listItemTextLeft: {
    flex: 3,
    fontFamily: 'suncheon',
    textAlign: 'center',    
  },
  listItemTextRight: {
    flex: 7,    
    fontFamily: 'suncheon',
    textAlign: 'center'
  },
});

