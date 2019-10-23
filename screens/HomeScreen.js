import React from 'react';
import {  
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
  TextInput,
} from 'react-native';
import { Constants, Font, Location, Permissions } from 'expo';
import singData from '../datas/singlist.json';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import Autocomplete from 'react-native-autocomplete-input';
import Hangul from 'hangul-js';
import moment from 'moment';
import marketData from '../datas/market.json';
import { getDistanceFromLatLonInKm } from '../utils/getDistanceKm';

const UPPER_BAR_HEIGHT = 60;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      isReady: false,
      cardsArray: [],
      loading: true,
      ganadaSort: 0,
      priceSort: 0,
      standardDate: {
        day: '',
        month: '',
        year: '',
      },
      query: '',
      searchList: [],
      place: '',
      location: {
        coords: {
          longitude: 126.9778284,
          latitude: 37.56631769,
        }
      }
    };    
  }
  
  async componentDidMount() {
    try {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      console.log(status);
      if (status !== 'granted') {
        this.setState({
          errorMessage: 'Permission to access location was denied',
        });
      }      
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      this.setState({ location });
      // var location = this.state.location;
      var marketObj = this.getDistance(location.coords);
      var examin_area_cd = marketObj.code;
      var examin_mrkt_cd = marketObj.market;
      var tempArray = [];
      var priceArray = [];
      await fetch(`API_URL`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: examin_area_cd,
          market: examin_mrkt_cd,
        })
      })
      .then(response => response.text())
      .then(data => {
        eval(data).forEach((el, idx) => {
          // console.log(el.item_code)
          var priceArrayElement = {
            place: marketObj.area,                
            priceCode: el.item_code,
            price: el.price,
            pricePer: el.unit,
          }
          priceArray.push(priceArrayElement);
        })
      })

      singData.forEach((element, index) => {
        var placeValue = '';
        var priceValue = 0;
        var pricePerValue = '';
        let result = priceArray.filter(obj => {          
          return obj.priceCode === element["품목코드"];
        });
        if(result.length != 0) {
          placeValue = result[0].place;          
          priceValue = parseInt(result[0].price);
          pricePerValue = result[0].pricePer;
        }        
        var temp = {
          id: index,
          title: element["품목명"],
          code: element["품목코드"],
          singsing: element["싱싱판별법"],
          category: element["카테고리"],
          goodmonth: element["제철"],
          season: element["계절"],
          place: placeValue,
          price: priceValue,
          pricePer: pricePerValue,      
        }
        tempArray.push(temp);
      });
      await Font.loadAsync({'suncheon': require('../assets/fonts/SuncheonB.ttf'),});
     this.setState({
      isReady: true,
      cardsArray: tempArray,
      loading: false,      
      place: marketObj.area,
     });
    } catch(err) {
        console.log("Error fetching data-----------", err);
    }
  }

  _sortByGanada() {
    var tempVal = 0;
    if(this.state.ganadaSort==0) {
      this.state.cardsArray.sort((a, b) => (a.title > b.title) ? 1 : -1);
      tempVal = 1;
    } else if(this.state.ganadaSort==1) {
      this.state.cardsArray.sort((a, b) => (a.title < b.title) ? 1 : -1);
      tempVal = 2;
    } else if(this.state.ganadaSort==2) {
      this.state.cardsArray.sort((a, b) => (a.title > b.title) ? 1 : -1);
      tempVal = 1;
    }    
    this.setState({
      cardsArray: this.state.cardsArray,
      ganadaSort: tempVal,
      priceSort: 0,
     });
  }

  _sortByPrice() {
    var tempVal = 0;
    if(this.state.priceSort==0) {
      this.state.cardsArray.sort((a, b) => (a.price > b.price) ? 1 : -1)
      tempVal = 1;
    } else if(this.state.priceSort==1) {
      this.state.cardsArray.sort((a, b) => (a.price < b.price) ? 1 : -1)
      tempVal = 2;
    } else if(this.state.priceSort==2) {
      this.state.cardsArray.sort((a, b) => (a.price > b.price) ? 1 : -1)
      tempVal = 1;
    }    
    this.setState({
      cardsArray: this.state.cardsArray,
      ganadaSort: 0,
      priceSort: tempVal,
     });
  }

  _isQueryIncluded(query, targetText) {
    const targetArray = Hangul.disassemble(targetText);
    const startIndexArray = Hangul.d(targetText, true).map(item => item.length).reduce((res, item) => {res.push(res[res.length - 1] + item); return res;}, [0]);
    return startIndexArray.some(index => {
      if (index + query.length > targetArray.length) {
        return false
      }
      return query.every((item, i) => item === targetArray[index + i]);
    });
  }

  _filterData(query) {
    if (query === '') {
      return [];
    }

    const { cardsArray } = this.state;
    const dQuery = Hangul.disassemble(query);

    return cardsArray.filter(
      item => this._isQueryIncluded(dQuery, item.title)
    );
  }

  ListViewItemSeparator = () => {
    return (
      <View
        style={{
          height: .5,
          width: "100%",
          backgroundColor: "#000",
        }}
      />
    );
  }

  getDistance(location) {
    var marketArray = [];
    var curLat = location.latitude;
    var curLng = location.longitude;    
    marketData.forEach((el, idx) => {      
      var distacneVal = getDistanceFromLatLonInKm(curLat, curLng, el["latitude"], el["longitude"]);
      var temp = {
        area: el["지역"],
        code: el["code"],
        market: el["market"],
        distance: distacneVal,        
      }
      marketArray.push(temp);
    });
    marketArray.sort(function (a, b) {
      return a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0;  
    });
    return marketArray[0];    
  }

  render() {    
    const { navigation } = this.props;
    const { loading, ganadaSort, priceSort, query } = this.state;
    const data = this._filterData(query);
    if(!loading && this.state.isReady) {      
      return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.container}>                      
            <View style={styles.autocompleteContainer}>
              <ImageBackground source={require("../assets/images/a1.png")} style={styles.imageBackGroundContainer}>                
                <TextInput                   
                  style={styles.autoCompleteElement}
                  onChangeText={text => this.setState({ query: text })}
                  value={query}
                  clearButtonMode='always'
                  placeholder="검색"
                  placeholderTextColor='white'
                  selectionColor='white'
                />
                {
                  query!='' ? <View style={{
                    position: 'absolute',
                    top: 13,
                    right: 30,
                    }}>
                    <TouchableOpacity                           
                      onPress={() => {
                        Keyboard.dismiss();
                        this.setState({ query: '' });
                      }}>
                        <View style={{width: 30, height: 30, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                          <Image
                            style={{width: 10, height: 10}}
                            source={require('../assets/images/d1.png')}
                          />
                        </View>                        
                    </TouchableOpacity>
                  </View> : <Text></Text>
                }
                <Autocomplete                
                  style={{width: 0, height: 0, transform: [{ scale: 0 }]}}                
                  inputContainerStyle={{borderColor: 'transparent',}}                
                  defaultValue={query}
                  onChangeText={text => this.setState({ query: text })}
                  hideResults={true}
                />
              </ImageBackground>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>            
            {              
              query==''
              ?
              <View style={styles.listContainer}>
                <View style={styles.dateInfoContainer}>
                  <FontAwesome name="location-arrow" size={12} color="#4d4d4d" />
                  <Text> {this.state.place} 기준</Text>
                </View>
                <View style={styles.listButton}>
                  <TouchableOpacity
                      onPress={() => {
                        this._sortByGanada();
                      }}>
                        {                                                          
                          ganadaSort == 1
                            ? 
                            <ImageBackground source={require("../assets/images/a2.png")} resizeMode= 'contain' style={styles.selectedButton}>
                              <Text style={{color: 'white', fontFamily: 'suncheon'}}>품명</Text>
                            </ImageBackground>
                            : (
                                ganadaSort == 2 
                                ? <ImageBackground source={require("../assets/images/a2.png")} resizeMode= 'contain' style={styles.selectedButton}>
                                    <Text style={{color: 'white', fontFamily: 'suncheon'}}>품명</Text>
                                  </ImageBackground>
                                : <ImageBackground source={require("../assets/images/a3.png")} resizeMode= 'contain' style={styles.selectedButton}>
                                    <Text style={{fontFamily: 'suncheon'}}>품명</Text>
                                  </ImageBackground>
                              )
                        }
                    </TouchableOpacity>
                    <TouchableOpacity           
                      onPress={() => {
                        this._sortByPrice();
                      }}>
                        {                                                          
                          priceSort == 1
                            ? 
                            <ImageBackground source={require("../assets/images/a2.png")} resizeMode= 'contain' style={styles.selectedButton}>
                              <Text style={{color: 'white', fontFamily: 'suncheon'}}>가격</Text>
                            </ImageBackground>
                            : (
                              priceSort == 2 
                                ? <ImageBackground source={require("../assets/images/a2.png")} resizeMode= 'contain' style={styles.selectedButton}>
                                    <Text style={{color: 'white', fontFamily: 'suncheon'}}>가격</Text>
                                  </ImageBackground>
                                : <ImageBackground source={require("../assets/images/a3.png")} resizeMode= 'contain' style={styles.selectedButton}>
                                    <Text style={{fontFamily: 'suncheon'}}>가격</Text>
                                  </ImageBackground>
                              )
                        }                        
                    </TouchableOpacity>
                </View>
                {
                this.state.cardsArray.map(( item, key ) =>
                  (
                    <TouchableOpacity
                      key={key}
                      onPress={() => {
                        navigation.navigate("Links", {"hi" : item});
                      }}>
                        <View style={styles.listItem}>
                          <Text style={{fontFamily: 'suncheon'}}>{item.title}</Text>
                          {
                            item.price != 0
                            ? <Text style={{fontFamily: 'suncheon'}}>{item.price}원/{item.pricePer}</Text>
                            : <Text style={{fontFamily: 'suncheon'}}>가격정보없음</Text>
                          }                          
                        </View>
                    </TouchableOpacity>
                  ))
                }
                <View style={styles.footerStyle}>
                  <ImageBackground source={require("../assets/images/a5.png")} style={styles.footerBackGroundContainer}>
                    <Text style={styles.footerFontStyle}>공공데이터를 사용하여 정보를 제공하고 있습니다.</Text>
                    <Text style={styles.footerFontStyle}>앱 관련 문의 사항은 contact@gong-ha.com</Text>
                    <Image style={{width: 40}}
                      resizeMode='contain'
                      source={require('../assets/images/a6.png')}
                    />
                  </ImageBackground>
                </View>      
              </View>              
              :
              <View>
                {
                  data.map((item, key) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => {
                        navigation.navigate("Links", {"hi" : item});
                        this.setState({ query: '' });
                      }}>
                        <View style={styles.searchListItem}>
                          <Text style={{fontFamily: 'suncheon',}}>{item.title}</Text>                          
                        </View>
                    </TouchableOpacity>
                  ))
                }
              </View>
            }
            </ScrollView>    
          </SafeAreaView>
        </TouchableWithoutFeedback>
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
    // marginTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
  },
  scrollContainer: {
    flex: 1,
    marginTop: UPPER_BAR_HEIGHT,
  },
  listButton: {
    flexDirection: 'row',
    width: Dimensions.get('window').width*0.8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  listItem: {
    flexDirection: 'row',
    width: Dimensions.get('window').width*0.8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2FA763',
    marginBottom: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  selectedButton: {
    width: Dimensions.get('window').width*0.35,
    height: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,    
    width: Dimensions.get('window').width,
    backgroundColor: '#60c26d',    
    height: UPPER_BAR_HEIGHT,    
  },
  imageBackGroundContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignItems: 'center',
    
  },
  autoCompleteElement: {
    fontFamily: 'suncheon',
    width: Dimensions.get('window').width*0.9,
    height: 40,
    fontSize: 20,
    color: 'white',    
    backgroundColor: '#468c58',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingLeft: 10,
    marginTop: 7,
  },
  dateInfoContainer: {
    width: Dimensions.get('window').width*0.8,
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    marginBottom: 5,
    paddingRight: 10,
  },
  listContainer: {
    flex: 1,    
    alignItems: 'center',
  },
  searchListItem: {    
    width: Dimensions.get('window').width,
    height: 50,
    flex: 1,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#55a56d',    
    padding: 10,
    paddingLeft: 30
  },
  footerStyle: {    
    width: Dimensions.get('window').width,
    height: 80,
    backgroundColor: "green",
    marginTop: 30,    
  },
  footerBackGroundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  footerFontStyle: {
    fontFamily: 'suncheon',
    fontSize: 8,
    color: 'white',
  }
});
