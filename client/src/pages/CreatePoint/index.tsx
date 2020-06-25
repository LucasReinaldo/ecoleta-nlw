import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { FiArrowLeft } from 'react-icons/fi';

import axios from 'axios';
import { join } from 'path';
import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';

interface ItemsProps {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFReponse {
  sigla: string;
}

interface IBGECityReponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<ItemsProps[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('0');
  const [selectedCity, setselectedCity] = useState<string>('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setSelectedPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('/items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFReponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados`,
      )
      .then((response) => {
        const countyInitials = response.data.map((county) => county.sigla);

        setCounties(countyInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedCounty === '0') return;

    axios
      .get<IBGECityReponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedCounty}/municipios`,
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);

        setCities(cityNames);
      });
  }, [selectedCounty]);

  function handleSelectedCounty(event: ChangeEvent<HTMLSelectElement>): void {
    const county = event.target.value;

    setSelectedCounty(county);
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>): void {
    const city = event.target.value;

    setselectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent): void {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  }

  function handleSelectedItem(id: number): void {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const county = selectedCounty;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('county', county);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    await api.post('/points', data);

    history.push('/');
  }

  return (
    <>
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta" />

          <Link to="/">
            <FiArrowLeft />
            Back to home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>Registre a new collection point</h1>

          <Dropzone onFileUpload={setSelectFile} />

          <fieldset>
            <legend>
              <h2>Personal information</h2>
            </legend>
            <div className="field">
              <label htmlFor="name">
                Entitie name
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">
                  Email address
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="field">
                <label htmlFor="whatsapp">
                  WhatsApp
                  <input
                    type="text"
                    name="whatsapp"
                    id="whatsapp"
                    onChange={handleInputChange}
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Address</h2>
              <span>Select the address in the map</span>
            </legend>
            <Map center={selectedPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={selectedPosition} />
            </Map>
            <div className="field-group">
              <div className="field">
                <label htmlFor="county">
                  County
                  <select
                    name="county"
                    id="county"
                    value={selectedCounty}
                    onChange={handleSelectedCounty}
                  >
                    <option value="0">County</option>
                    {counties.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="field">
                <label htmlFor="city">
                  City
                  <select
                    name="city"
                    id="city"
                    value={selectedCity}
                    onChange={handleSelectedCity}
                  >
                    <option value="0">City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Collection items</h2>
              <span>Choose one or more items below</span>
            </legend>

            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectedItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>
          <button type="submit">Registre collection point</button>
        </form>
      </div>
    </>
  );
};

export default CreatePoint;
