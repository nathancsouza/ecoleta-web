import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import { useToast } from '../../hooks/Toast';

import api from '../../services/api'

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

const CreatePoint = () => {

  const { addToast } = useToast();
  
  const [ items, setItems ] = useState<Item[]>([]);

  const [ formData, setFormData ] = useState({
    name: '',
    email: '',
    contact: '',
    city: '',
    state: '',
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    })
  }, [])
  
  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, [])

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData( { ...formData, [name]: value })
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, contact, state, city } = formData;
    const [ latitude, longitude ] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      contact,
      state,
      city,
      latitude,
      longitude,
      items
    }

    await api.post('/points', data);

    alert('Point successfully created.')
    history.push('/');
  }
  
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft/>
          Back to home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Collection point <br /> registration</h1>

        <fieldset>
          <legend>
            <h2>Information</h2>
          </legend>

          <div className="field">
                <label htmlFor="name">Company name</label>
                <input 
                type="text"
                name="name"
                id="name" 
                onChange={handleInputChange}
                placeholder="Enter your company name"
                />
          </div> 

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input 
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
              placeholder="Enter your email"            
              />
            </div>

            <div className="field">
              <label htmlFor="contact">Contact</label>
              <input 
              type="text"
              name="contact"
              id="contact"
              onChange={handleInputChange}
              placeholder="Enter your contact number"            
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Address</h2>
            <span>Select the address on the map</span>
          </legend>

          <Map center={initialPosition} zoom={14} onclick={handleMapClick}>
            <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
                <label htmlFor="province">State/Province</label>
                <input 
                type="text"
                name="state"
                id="state" 
                onChange={handleInputChange}
                placeholder="Enter your state"
                />
            </div>

            <div className="field">
                <label htmlFor="city">City</label>
                <input 
                type="text"
                name="city"
                id="city" 
                onChange={handleInputChange}
                placeholder="Enter your city"
                />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Collection items</h2>
            <span>Select one or more items below</span>
          </legend>

          <ul className="items-grid">

            {items.map(item => (
              <li 
              key={item.id} 
              onClick={() => handleSelectItem(item.id)}
              className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
              <img src={item.image_url} alt={item.title}/>
              <span>{item.title}</span>
            </li>
            ))}
            
          </ul>

        </fieldset>

        <button type="submit">Register collection point</button>
      </form>
    </div>
  )
}

export default CreatePoint;