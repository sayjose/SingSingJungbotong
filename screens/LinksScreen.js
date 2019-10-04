import React from 'react';
import {  
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import e1 from '../assets/images/e1.png';
import e2 from '../assets/images/e2.png';

export default class LinksScreen extends React.Component {
  
  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    const {setParams} = this.props.navigation;
    setParams({title: this.props.navigation.getParam("hi").title});
  }

  render() {
    const { navigation } = this.props;
    var item = navigation.getParam("hi");
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.scrollViewInside}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}>
                <View style={styles.headerImageContainer}>
                  <Image style={styles.gobackImage} source={e2}/>
                </View>      
              </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Settings", {"hi" : navigation.getParam("hi")});
                }}>
                <ImageBackground style={styles.priceImage} imageStyle={{ borderRadius: 8 }} source={e1}>
                  <Text style={styles.priceText}>{item.place} : {item.price}/{item.pricePer}</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
            <View style={styles.listItem}>
              <Image source={{uri: "http://search.at.or.kr//images/items/item_image_"+item.code+".png"}} style={{width: '100%', height: 200}} resizeMode='contain'></Image>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.itemText}>{item.singsing}</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.itemText}>제철: {item.goodmonth}월</Text>
              <Text style={styles.itemText}>계절: {item.season}</Text>
            </View>
          </View>
        </ScrollView>    
      </SafeAreaView>      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    width: Dimensions.get('window').width,    
  },
  scrollViewInside: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: Dimensions.get('window').width,
    marginTop: 10,
  },
  headerImageContainer: {
    width: 40, 
    height: 40,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gobackImage: {
    resizeMode: 'contain',
    height: 20,
    width: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width*0.8,
    marginTop: 20,
  },
  titleText: {
    color: '#4d4d4d',
    fontSize: 30,
    fontFamily: 'suncheon',
  },
  priceImage: {
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
    height: 40,
    width: 160,
  },
  priceText: {
    color: 'white',
    fontFamily: 'suncheon',
  },
  listItem: {
    width: Dimensions.get('window').width*0.8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#55a56d',
    marginTop: 10,
    padding: 10,
  },
  itemText: {
    fontFamily: 'suncheon',
    fontSize: 20,
    lineHeight: 30,
  },
});

