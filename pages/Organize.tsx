// Import required dependencies
import React, { useState } from 'react';
import { Person } from '../utils/organize'; // Import the Person interface
import { createGroups } from '../utils/organize'; // Import the createGroups function

interface PersonInput extends Omit<Person, 'notCompatible'> {
  notCompatible: string;
}

const GroupSorter: React.FC = () => {
  const getNextId = (people: PersonInput[]): number => {
    return Math.max(...people.map((person) => person.id)) + 1;
  };

  const emptyPerson = (id: number): PersonInput => ({
    id,
    name: '',
    commercialSuccess: 0,
    residentialSuccess: 0,
    notCompatible: '',
    cannotBeChairman: false,
  });

  const [people, setPeople] = useState<PersonInput[]>([emptyPerson(0)]);
  const [finalizedGroups, setFinalizedGroups] = useState<Array<{ type: string; chairman: Person; members: Person[] }>>([]);
  const [residentialGroups, setResidentialGroups] = useState<number>(0);
  const [commercialGroups, setCommercialGroups] = useState<number>(0);
  const [peopleInGroup, setPeopleInGroup] = useState<number>(0);

  const handleChange = (index: number, key: keyof PersonInput, value: any) => {
    const newPeople = [...people];
    newPeople[index] = { ...newPeople[index], [key]: value };
    setPeople(newPeople);
  };

  const addPerson = () => {
    setPeople([...people, emptyPerson(getNextId(people))]);
  };

  const removePerson = () => {
    if (people.length > 1) {
      setPeople(people.slice(0, -1));
    }
  }

  const sortGroups = () => {
    if (people.length > 0 && peopleInGroup > 0 && (residentialGroups > 0 || commercialGroups > 0)) {
      if ((people.length >= peopleInGroup * (residentialGroups + commercialGroups)) && (people.length % (peopleInGroup * (residentialGroups + commercialGroups)) < peopleInGroup)) {
        const peopleToSort = people.map<Person>((person) => ({
          ...person,
          notCompatible: person.notCompatible
            ? person.notCompatible.split(',').map((id) => parseInt(id.trim()))
            : [],
        }));

        const groups = createGroups(peopleToSort, peopleInGroup, residentialGroups, commercialGroups);
        setFinalizedGroups(groups);
      } else {
        alert('The number of people must be divisible by the number of people in a group');
      }
    } else {
      alert('Please fill out all the fields');
    }
  };

  return (
    <div className='flex flex-col justify-center items-center'>
      <h1 className='text-3xl m-5 font-bold text-center'>Review Board Group Organizer</h1>
      <div className="flex flex-col w-[75%] items-center justify-center">
        <div className='hidden sm:flex flex-row w-fit justify-center items-center mb-2 bg-slate-700 border border-1 border-slate-500 rounded-md p-2'>
          <p className='mr-5 text-sm text-center'>Index</p>
          <p className='mr-5 text-sm text-center'>Name</p>
          <p className='mr-5 text-sm text-center'>Commercial Success (0-100)</p>
          <p className='mr-5 text-sm text-center'>Residential Success (0-100)</p>
          <p className='mr-5 text-sm text-center'>Not Compatible (comma separated IDs)</p>
          <p className='mr-5 text-sm text-center'>Cannot be Chairman</p>
        </div>
        {people.map((person, index) => (
          <div key={index} className='flex flex-col sm:flex-row w-fit justify-center items-center mb-2 bg-slate-700 border border-1 border-slate-500 rounded-md p-2'>
            <p className='mb-3 sm:mb-0 mr-2 hidden sm:flex'>{index}.</p>
            <input
              type="text"
              placeholder="Name"
              value={person.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              className="mb-3 sm:mb-0 mr-2 w-40 sm:w-56 p-1 border border-slate-500 rounded-sm bg-slate-800"
              required
            />
            <input
              type="number"
              placeholder="Commercial Success"
              min="0"
              max="100"
              value={person.commercialSuccess}
              onChange={(e) => handleChange(index, 'commercialSuccess', parseFloat(e.target.value))}
              className="mb-3 sm:mb-0 mr-2 w-12 p-1 border border-slate-500 rounded-sm bg-slate-800"
              required
            />
            <input
              type="number"
              placeholder="Residential Success"
              min="0"
              max="100"
              value={person.residentialSuccess}
              onChange={(e) => handleChange(index, 'residentialSuccess', parseFloat(e.target.value))}
              className="mb-3 sm:mb-0 mr-2 w-12 p-1 border border-slate-500 rounded-sm bg-slate-800"
              required
            />
            <input
              type="text"
              placeholder="0,1,2,3,..."
              value={person.notCompatible}
              onChange={(e) => handleChange(index, 'notCompatible', e.target.value)}
              className="mb-3 sm:mb-0 mr-2 w-[150px] sm:w-[300px] p-1 border border-slate-500 rounded-sm bg-slate-800"
            />
            <label>
              Cannot be Chairman: 
              <input
                type="checkbox"
                checked={person.cannotBeChairman}
                onChange={(e) => handleChange(index, 'cannotBeChairman', e.target.checked)}
                className="mr-2 ml-1 rounded-sm accent-slate-500"
              />
            </label>
          </div>
        ))}
      </div>
      <div className='flex flex-row justify-center items-center mt-1 mb-3'>
        <button onClick={addPerson} className="bg-slate-700 py-1 px-2 border-slate-500 border rounded-md">Add Person</button>
        <button onClick={removePerson} className="bg-slate-700 py-1 px-2 ml-2 border-slate-500 border rounded-md">Remove Person</button>
      </div>
      <div className='flex flex-col sm:flex-row item-center justify-center my-2'>
        <label className='flex flex-row item-center justify-center mb-2'>
          Residential Groups: 
          <input
            type="number"
            min="0"
            value={residentialGroups}
            onChange={(e) => setResidentialGroups(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </label>
        <label className='flex flex-row item-center justify-center ml-0 sm:ml-4'>
          Commercial Groups:
          <input
            type="number"
            min="0"
            value={commercialGroups}
            onChange={(e) => setCommercialGroups(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 h-fit p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </label>
        <label className='flex flex-row item-center justify-center ml-0 sm:ml-4'>
          People per group:
          <input
            type="number"
            min="1"
            value={peopleInGroup}
            onChange={(e) => setPeopleInGroup(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 h-fit p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </label>
      </div>
      <button onClick={sortGroups} className='bg-slate-700 py-1 px-2 mt-1 mb-2 ml-2 border-slate-500 border rounded-md'>Sort</button>
      {finalizedGroups.length > 0 && (
        <div className='flex flex-col justify-center items-center mb-5 mt-5'>
          <h2 className='text-2xl font-bold'>Finalized Groups:</h2>
          <div className='flex flex-row justify-center items-center flex-wrap'>
            {finalizedGroups.map((group, index) => (
              <div key={index} className='bg-slate-700 m-2 p-2 border-slate-500 border rounded-md'>
                <h3>{group.type} Group</h3>
                <h1 className='bg-amber-300 flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900'>
                  {group.chairman.name} (ID: {group.chairman.id}) - CS: {group.chairman.commercialSuccess} - RS: {group.chairman.residentialSuccess}
                  </h1>
                <ul>
                  {group.members.map((member) => (
                    <li key={member.id} className="bg-slate-200 flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900">
                      {member.name} (ID: {member.id}) - CS: {member.commercialSuccess} - RS: {member.residentialSuccess}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSorter;