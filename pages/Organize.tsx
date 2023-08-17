// Import required dependencies
import React, { useState } from 'react';
import { Person, Panel, getGroupTypeLabel } from '../utils/organize';
import { assignMembersToPanels } from '../utils/organize';
import { exportPanelsToExcel, panelColors } from '@/utils/exportSheet';
import { FaGithub } from 'react-icons/fa';
import ImportCSVButton from '@/components/ImportCSVButton';

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
    assignAsChairman: false,
    landExpertise: 0,
    BPPE: 0,
    type: '',
    doNotAssign: false
  });

  const [people, setPeople] = useState<PersonInput[]>([emptyPerson(0)]);
  const [panels, setPanels] = useState<Panel[]>([]); 
  const [unAssignedPeople, setUnAssignedPeople] = useState<Person[]>([]);
  const [residentialGroups, setResidentialGroups] = useState<number>(0);
  const [commercialGroups, setCommercialGroups] = useState<number>(0);
  const [landGroups, setLandGroups] = useState<number>(0);
  const [BPPEGroups, setBPPEGroups] = useState<number>(0);
  const [peopleInGroup, setPeopleInGroup] = useState<number>(0);

  const handlePeopleDataImported = (data: any[]) => {
    const processedData: PersonInput[] = data.map((row, index) => ({
      id: row.Index,
      name: row.Name,
      commercialSuccess: parseFloat(row.CE),
      landExpertise: parseFloat(row.LE),
      residentialSuccess: parseFloat(row.RE),
      BPPE: parseFloat(row.BPPE),
      type: row.Type,
      notCompatible: row.NotCompatible,
      assignAsChairman: row.AssignAsChairman === "TRUE",
      doNotAssign: row.DoNotAssign === "TRUE"
    }));

    setPeople(processedData);
  };

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
      if ((people.length >= peopleInGroup * (residentialGroups + commercialGroups + landGroups + BPPEGroups))) {
        const peopleToSort = people.map<Person>((person) => ({
          ...person,
          notCompatible: person.notCompatible
            ? person.notCompatible.split(',').map((id) => parseInt(id.trim()))
            : [],
        }));
        const emptyPanels = [] as Panel[];
        let roomNumber = 1;

        for (let i = 0; i < residentialGroups; i++) {
          emptyPanels.push({
            type: 'R',
            roomNumber: roomNumber,
            chairman: null,
            members: [],
          });
          roomNumber++;
        }
        for (let i = 0; i < commercialGroups; i++) {
          emptyPanels.push({
            type: 'C',
            roomNumber: roomNumber,
            chairman: null,
            members: [],
          });
          roomNumber++;
        }
        for (let i = 0; i < landGroups; i++) {
          emptyPanels.push({
            type: 'L',
            roomNumber: roomNumber,
            chairman: null,
            members: [],
          });
          roomNumber++;
        }
        for (let i = 0; i < BPPEGroups; i++) {
          emptyPanels.push({
            type: 'BPP',
            roomNumber: roomNumber,
            chairman: null,
            members: [],
          });
          roomNumber++;
        }

        const [finalizedPanels, unAssignedMembers] = assignMembersToPanels(peopleToSort, emptyPanels, peopleInGroup);
        
        setUnAssignedPeople(unAssignedMembers);
        setPanels(finalizedPanels);
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
      <h1>People</h1>
      <div className="flex flex-col w-full sm:w-[75%] items-center justify-center">
        <div className='flex flex-wrap w-full justify-between items-center mb-2 bg-slate-700 border border-1 border-slate-500 rounded-md px-2'>
            <p className='text-sm text-center w-10'>Index</p>
            <div className="name-header flex-1 mr-2">
                <p className='text-sm w-full text-center'>Name</p>
            </div>
            <p className='text-sm text-center w-16 mr-2'>CS (0-100)</p>
            <p className='text-sm text-center w-16 mr-2'>RS (0-100)</p>
            <p className='text-sm text-center w-16 mr-2'>LE (0-100)</p>
            <p className='text-sm text-center w-16 mr-2'>BPPE (0-100)</p>
            <p className='text-sm text-center flex-1 mr-2'>Assign as Chairman</p>
            <p className='text-sm text-center w-24 mr-2'>Not Compatible (IDs)</p>
            <p className='text-sm text-center w-20 mr-2'>Type (R, CS, A)</p>
            <p className='text-sm text-center flex-1 mr-2'>Do Not Assign</p>
          </div>
        {people.map((person, index) => (
        <div key={index} className="flex flex-wrap w-full justify-between items-center mb-2 bg-slate-700 border border-1 border-slate-500 rounded-md p-2">
            <p className='w-10'>{person.id}.</p>
            <div className="name-input flex-1 mr-2">
              <input
                  type="text"
                  placeholder="Name"
                  value={person.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full p-1 border border-slate-500 rounded-sm bg-slate-800"
                  required
              />
            </div>
            <input 
              type="number"
              placeholder="Commercial Success"
              value={person.commercialSuccess}
              onChange={(e) => handleChange(index, 'commercialSuccess', parseFloat(e.target.value))}
              className="w-16 p-1 border border-slate-500 rounded-sm bg-slate-800 mr-2"
              required
            />
            <input
              type="number"
              placeholder="Residential Success"
              value={person.residentialSuccess}
              onChange={(e) => handleChange(index, 'residentialSuccess', parseFloat(e.target.value))}
              className="w-16 p-1 border border-slate-500 rounded-sm bg-slate-800 mr-2"
              required
            />
            <input
              type="number"
              placeholder="Land Expertise"
              value={person.landExpertise}
              onChange={(e) => handleChange(index, 'landExpertise', parseFloat(e.target.value))}
              className="w-16 p-1 border border-slate-500 rounded-sm bg-slate-800 mr-2"
              required
            />
            <input
              type="number"
              placeholder="BPPE"
              value={person.BPPE}
              onChange={(e) => handleChange(index, 'BPPE', parseFloat(e.target.value))}
              className="w-16 p-1 border border-slate-500 rounded-sm bg-slate-800 mr-2"
              required
            />
            <div className="flex items-center flex-1 mr-2">
                <label className="text-sm text-center w-full">
                    Assign as Chairman:
                    <input
                        type="checkbox"
                        checked={person.assignAsChairman}
                        onChange={(e) => handleChange(index, 'assignAsChairman', e.target.checked)}
                        className="ml-2 rounded-sm accent-slate-500"
                    />
                </label>
            </div>
            <input
                type="text"
                placeholder="0,1,2,3,..."
                value={person.notCompatible}
                onChange={(e) => handleChange(index, 'notCompatible', e.target.value)}
                className="w-24 p-1 border border-slate-500 rounded-sm bg-slate-800 not-compatible-input mr-2"
            />
            <input
                type="text"
                placeholder="R, CS, A"
                value={person.type}
                onChange={(e) => handleChange(index, 'type', e.target.value)}
                className="w-20 p-1 border border-slate-500 rounded-sm bg-slate-800 type-input mr-2"
                required
            />
            <div className="flex items-center flex-1 mr-2">
                <label className="text-sm text-center w-full">
                    Do Not Assign:
                    <input
                        type="checkbox"
                        checked={person.doNotAssign}
                        onChange={(e) => handleChange(index, 'doNotAssign', e.target.checked)}
                        className="ml-2 rounded-sm accent-slate-500"
                    />
                </label>
            </div>
          </div>
        ))}
      </div>
      <div className='flex flex-row justify-center items-center mt-1 mb-3'>
        <button onClick={addPerson} className="bg-slate-700 py-1 px-2 border-slate-500 border rounded-md">Add Person</button>
        <button onClick={removePerson} className="bg-slate-700 py-1 px-2 ml-2 border-slate-500 border rounded-md">Remove Person</button>
        <ImportCSVButton onDataImported={handlePeopleDataImported}/>
      </div>
      <div className='flex flex-col sm:flex-row item-center justify-center my-2'>
        <div className="flex flex-row items-center mr-2 py-1 px-2 border-slate-500 border rounded-md" style={{ backgroundColor: "#" + panelColors['R'] + "88" }}>
          <p className='h-fit p-0 m-0 items-center justify-center'>Residential Groups: </p>
          <input
            type="number"
            min="0"
            value={residentialGroups}
            onChange={(e) => setResidentialGroups(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </div>
        <div className="flex flex-row items-center mr-2 py-1 px-2 border-slate-500 border rounded-md" style={{ backgroundColor: "#" + panelColors['C'] + "88" }}>
          <p className='h-fit p-0 m-0 items-center justify-center'>Commercial Groups: </p>
          <input
            type="number"
            min="0"
            value={commercialGroups}
            onChange={(e) => setCommercialGroups(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </div>
        <div className="flex flex-row items-center mr-2 py-1 px-2 border-slate-500 border rounded-md" style={{ backgroundColor: "#" + panelColors['L'] + "88" }}>
          <p className='h-fit p-0 m-0 items-center justify-center'>Land Groups: </p>
          <input
            type="number"
            min="0"
            value={landGroups}
            onChange={(e) => setLandGroups(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </div>
        <div className="flex flex-row items-center mr-2 py-1 px-2 border-slate-500 border rounded-md" style={{ backgroundColor: "#" + panelColors['BPP'] + "88" }}>
          <p className='h-fit p-0 m-0 items-center justify-center'>BPPE Groups: </p>
          <input

            type="number"
            min="0"
            value={BPPEGroups}
            onChange={(e) => setBPPEGroups(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </div>
        <div className="flex flex-row items-center bg-slate-700 py-1 px-2 border-slate-500 border rounded-md">
          <p className='h-fit p-0 m-0 items-center justify-center'>People per group: </p>
          <input
            type="number"
            min="1"
            value={peopleInGroup}
            onChange={(e) => setPeopleInGroup(parseInt(e.target.value))}
            className='mb-3 sm:mb-0 ml-2 w-10 p-1 border border-slate-500 rounded-sm bg-slate-800'
          />
        </div>
      </div>
      <button onClick={sortGroups} className='bg-slate-700 py-1 px-2 mt-1 mb-2 ml-2 border-slate-500 border rounded-md'>Sort</button>
      {panels.length > 0 && (
        <div className='flex flex-col justify-center items-center mb-5 mt-5'>
          <h2 className='text-2xl font-bold'>Finalized Groups:</h2>
          <p>Regular: { 
            panels.reduce((count, panel) => count + panel.members.filter(member => member.type === 'R').length, 0) 
          }</p>
          <p>Auxilary: {
            panels.reduce((count, panel) => count + panel.members.filter(member => member.type === 'A').length, 0)
          }</p>
          <div className='flex flex-row justify-center items-center flex-wrap'>
            {panels.map((group, index) => (
              <div key={index} className=' m-2 p-2 border-slate-500 border rounded-md'  style={{ backgroundColor: "#" + panelColors[group.type] + "88" }}>
                  <h3>
                      Room {group.roomNumber} - {getGroupTypeLabel(group.type)} - Average Success : {
                          (group.members.reduce((sum, member) => {
                              switch(group.type) {
                                  case 'C':
                                      return sum + member.commercialSuccess;
                                  case 'L':
                                      return sum + member.landExpertise;
                                  case 'R':
                                      return sum + member.residentialSuccess;
                                  case 'BPP':
                                      return sum + member.BPPE;
                                  default:
                                      return sum;
                              }
                          }, 0)) / group.members.length
                      }
                  </h3>
                  <ul>
                  {group.members.map((member) => {
                      const hasIncompatibility = group.members.some(otherMember => member.notCompatible.includes(otherMember.id));
                      return (
                          group.chairman?.name === member.name ? (
                              <li 
                                  key={member.id} 
                                  className={`flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900 ${hasIncompatibility ? 'bg-red-500' : 'bg-amber-200'}`}
                              >
                                  {member.name} (ID: {member.id}) - CS: {member.commercialSuccess} - RS: {member.residentialSuccess} - LE: {member.landExpertise} - BPPE: {member.BPPE}
                              </li>
                          ) : (
                              <li 
                                  key={member.id} 
                                  className={`flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900 ${hasIncompatibility ? 'bg-red-500' : 'bg-slate-200'}`}
                              >
                                  {member.name} (ID: {member.id}) - CS: {member.commercialSuccess} - RS: {member.residentialSuccess} - LE: {member.landExpertise} - BPPE: {member.BPPE}
                              </li>
                          )
                      );
                  })}
              </ul>
              </div>
          ))}
          </div>
        </div>
      )}
      {
        unAssignedPeople.length > 0 && (
          <div className='flex flex-col justify-center items-center mb-5 mt-5'>
            <h2 className='text-2xl font-bold'>Unassigned People ({ unAssignedPeople.length }):</h2>
            <div className='flex flex-row justify-center items-center flex-wrap'>
              <p>Do Not Assigns:</p>
              <div className='bg-slate-700 m-2 p-2 border-slate-500 border rounded-md'>
                {unAssignedPeople.filter(person => person.doNotAssign).map((person, index) => (
                  <h1 key={index} className='bg-slate-200 flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900'>
                    {person.name} - DNA: {person.doNotAssign ? "True" : "False"}
                  </h1>
                ))}
              </div>
              <p>Customer Support:</p>
              <div className='bg-slate-700 m-2 p-2 border-slate-500 border rounded-md'>
                {unAssignedPeople.filter(person => person.type === 'CS').map((person, index) => (
                  <h1 key={index} className='bg-slate-200 flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900'>
                    {person.name} - Type: {person.type}
                  </h1>
                ))}
              </div>
              <p>Other:</p>
              <div className='bg-slate-700 m-2 p-2 border-slate-500 border rounded-md'>
                {unAssignedPeople.filter(person => person.type !== 'CS' && !person.doNotAssign).map((person, index) => (
                  <h1 key={index} className='bg-slate-200 flex items-center justify-center border border-slate-500 rounded-md py-1 px-2 my-1 text-slate-900'>
                    {person.name} - Type: {person.type}
                  </h1>
                ))}
              </div>
            </div>
            <button className="bg-slate-700 py-1 px-2 border-slate-500 border rounded-md" onClick={() => exportPanelsToExcel(panels)}>Export to Excel</button>
          </div>
        )
      }
      <FaGithub
				onClick={() =>
					window.open(
						'https://github.com/AidenStickney/review-board-group-organizer'
					)
				}
				style={{
					right: '0',
					height: '3vh',
					width: '3vh',
					margin: '1.1vh',
					cursor: 'pointer',
					bottom: '0',
					position: 'fixed',
				}}
			/>
    </div>
  );
};

export default GroupSorter;