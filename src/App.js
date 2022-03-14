import './App.css';
import React, { useState } from 'react';
import CSVReader from 'react-csv-reader'



function App() {
  const [finalResult, setFinalResult] = useState([]);
  let dataArr = [];
  let projectIDs = new Set();
  let uniqueArr = [];
  let projectGroups = [];
  let pairs = [];

  function CSVtoArr(data) {
    for (let i = 1; i < data.length - 1; i++) {
      let tempObj = {};
      tempObj[data[0][0]] = data[i][0]
      tempObj[data[0][1]] = data[i][1]
      tempObj[data[0][2]] = data[i][2]
      tempObj[data[0][3]] = data[i][3]
      dataArr = [...dataArr, tempObj]
    }
    sortProjectUsers(dataArr)
  }

  function sortProjectUsers(dataArr) {
    dataArr.map(el => projectIDs.add(el.ProjectID))
    projectIDs.forEach(project => {
      projectGroups.push(dataArr.filter(obj => obj.ProjectID === project))
    })

    projectGroups.forEach(project => {
      if (project.length > 1) {
        for (let i = 0; i < project.length; i++) {
          for (let j = i + 1; j < project.length; j++) {
            uniqueArr = [...uniqueArr, [project[i], project[j]]]
          }
        }
      }
    })
    uniqueArr.forEach(pair => {
      let employeeObj = {}
      let days = checkOverlap(pair[0].DateFrom, pair[0].DateTo, pair[1].DateFrom, pair[1].DateTo);
      if (days > 0) {
        employeeObj = {
          projectDays: days,
          projectID: pair[0].ProjectID,
          emp1: pair[0].EmpID,
          emp2: pair[1].EmpID,
          daysTogether: 0
        }
        pairs.push(employeeObj)

      }
    })
    pairs.map(outer => {
      outer.daysTogether = pairs.filter(inner =>
        outer.emp1 == inner.emp1 && outer.emp2 == inner.emp2).reduce((prev, curr) => {
          return prev + curr.projectDays
        }, 0)
    })

    let longest = pairs.sort((el1, el2) => el2.daysTogether - el1.daysTogether)[0];
    let final = pairs.filter(emloyee =>
      emloyee.daysTogether == longest.daysTogether &&
      emloyee.emp1 == longest.emp1 &&
      emloyee.emp2 == longest.emp2)
    setFinalResult(final)
  }

  const checkOverlap = (e1d1, e1d2, e2d1, e2d2) => {
    const startDate1 = new Date(e1d1);
    const endDate1 = e1d2 === null ? new Date() : new Date(e1d2);
    const startDate2 = new Date(e2d1);
    const endDate2 = e2d2 === null ? new Date() : new Date(e2d2);

    const start = startDate1 < startDate2 ? startDate2 : startDate1;
    const end = endDate1 < endDate2 ? endDate1 : endDate2;

    if (end >= start) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };



  return (
    <div className='container'>
      <CSVReader onFileLoaded={(data) => CSVtoArr(data)} />
      {finalResult.length != 0 &&
        <div className='displayDiv'>
          <h3>Days worked: {finalResult[0].daysTogether}</h3>
          <h3>ProjectID: {finalResult[0].projectID}</h3>
          <h3>Employee: {finalResult[0].emp1}</h3>
          <h3>Employee: {finalResult[0].emp2}</h3>
        </div>
      }

    </div>
  )
}

export default App;


