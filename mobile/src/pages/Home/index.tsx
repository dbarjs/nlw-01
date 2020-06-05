import React, { useState, useEffect } from "react";
import { Feather as Icon } from "@expo/vector-icons";
import { View, Image, StyleSheet, Text, ImageBackground } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect, { Item } from "react-native-picker-select";
import { ibgeApi } from "../../services/api";

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}

interface IBGECityResponse {
  nome: string;
}

function sortByLabel(a: Item, b: Item) {
  if (a.label > b.label) {
    return 1;
  }
  if (a.label < b.label) {
    return -1;
  }
  return 0;
}

const Home = () => {
  const navigation = useNavigation();

  const [ufs, setUfs] = useState<Item[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>("");
  const [cities, setCities] = useState<Item[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    ibgeApi.get<IBGEUFResponse[]>("estados").then((response) => {
      const ufs = response.data
        .map((uf) => ({
          label: uf.nome,
          value: uf.sigla,
          key: uf.sigla,
        }))
        .sort(sortByLabel);
      setUfs(ufs);
    });
  }, []);

  useEffect(() => {
    if (selectedUf) {
      ibgeApi
        .get<IBGECityResponse[]>(`estados/${selectedUf}/municipios`)
        .then((response) => {
          const cities = response.data.map((city) => ({
            label: city.nome,
            value: city.nome,
            key: city.nome,
          }));
          setCities(cities);
        });
    }
  }, [selectedUf]);

  function handleUfChange(value: string) {
    setSelectedUf(value);
  }

  function handleNavigationToPoints() {
    navigation.navigate("Points", { uf: selectedUf, city: selectedCity });
  }

  return (
    <ImageBackground
      source={require("../../assets/home-background.png")}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require("../../assets/logo.png")} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>
          Ajudamos pessoas a encontrarem ponto de coleta de forma eficiente.
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.selectContainer}>
          <RNPickerSelect
            items={ufs}
            onValueChange={(value: string) => {
              setSelectedUf(value);
            }}
            placeholder={{
              label: "Selecione um estado",
              value: null,
            }}
            style={{
              inputAndroid: {
                ...styles.select,
              },
              inputIOS: {
                ...styles.select,
              },
            }}
          />
        </View>
        <View style={styles.selectContainer}>
          <RNPickerSelect
            items={cities}
            onValueChange={(value: string) => {
              setSelectedCity(value);
            }}
            disabled={!cities.length}
            placeholder={{
              label: "Selecione uma cidade",
              value: null,
            }}
            style={{
              inputAndroid: {
                ...styles.select,
              },
              inputIOS: {
                ...styles.select,
              },
            }}
          />
        </View>
        <RectButton style={styles.button} onPress={handleNavigationToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#fff" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  selectContainer: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },

  select: {
    margin: 0,
  },

  input: {
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

export default Home;
