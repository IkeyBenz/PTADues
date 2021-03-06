const firebase = require("firebase");

const groupsRef = firebase.database().ref("roles");
const orderedGroupsRef = firebase.database().ref("arrangements");
const facultyRef = firebase.database().ref("members");
const highschoolRef = firebase.database().ref('highschool');

module.exports = (function() {
  function downloadFaculty() {
    return Promise.all([
      facultyRef.once("value"),
      groupsRef.once("value"),
      orderedGroupsRef.once("value")
    ]).then(vals => {
      return {
        faculty: vals[0].val(),
        groups: vals[1].val(),
        orderedGroups: vals[2].val()
      };
    });
  }
  function formattedFaculty(d) {
    return Object.keys(d.faculty).map((memberKey) => ({
      id: memberKey,
      name: d.faculty[memberKey].Name,
      info: d.faculty[memberKey].Info,
    })).sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }
  function teacherExists(teachers, faculty) {
    if (typeof teachers == "object") {
      for (let teacherKey of teachers) {
        if (!faculty[teacherKey]) {
          return false;
        }
      }
      return true;
    } else {
      return (teachers !== "" && faculty[teachers]) || false;
    }
  }
  function getTeacherName(teachers, faculty) {
    if (typeof teachers == "object") {
      return teachers
        .map(key => {
          return faculty[key].Name;
        })
        .join(", ");
    }
    return faculty[teachers].Name;
  }

  function formattedGroup(d, groupName) {
    return d.orderedGroups && d.orderedGroups[groupName]
      ? d.orderedGroups[groupName].map(key => {
          const teacherKey = d.groups[groupName][key].Teacher;
          const assistantKey = d.groups[groupName][key].Assistants || undefined;
          const teacherName = teacherExists(teacherKey, d.faculty)
            ? getTeacherName(teacherKey, d.faculty)
            : "";
          const assistantName =
            assistantKey && teacherExists(assistantKey, d.faculty)
              ? getTeacherName(assistantKey, d.faculty)
              : "";
          return {
            ...d.groups[groupName][key],
            id: key,
            teacherName,
            assistantName
          };
        })
      : {};
  }
  function formattedMisc(d) {
    return !!d.orderedGroups.Administration
      ? d.orderedGroups.Administration.map(groupKey => {
          const group = d.groups.Administration[groupKey];
          return {
            Title: group.Title,
            id: groupKey,
            Members: group.Members
              ? group.Members.map(containerKey => {
                  const memberKey =
                    d.groups.Administration.Containers[containerKey];
                  const member =
                    memberKey !== "Unselected" && d.faculty[memberKey];
                  return member
                    ? {
                        name:
                          member.Name +
                          (member.Info ? ` (${member.Info})` : ""),
                        id: memberKey,
                        container: containerKey
                      }
                    : { name: "", id: "", container: containerKey };
                })
              : []
          };
        })
      : [];
  }
  function getFaculty() {
    return downloadFaculty().then(d => {
      return {
        elementary: formattedGroup(d, "Elementary"),
        faculty: formattedFaculty(d),
        nursary: formattedGroup(d, "Nursary"),
        middleSchool: formattedGroup(d, "MiddleSchool"),
        administration: formattedMisc(d)
      };
    });
  }
  function getLastOrderedIndexOf(category) {
    return orderedGroupsRef
      .child(category)
      .once("value")
      .then(snapshot => {
        return (snapshot.val() && snapshot.val().length) || 0;
      });
  }
  function updateAtPath(path, data) {
    return groupsRef.child(path).set(data);
  }
  function createClass(path, data) {
    return getLastOrderedIndexOf(path).then(index => {
      orderedGroupsRef
        .child(`${path}/${index}`)
        .set(groupsRef.child(path).push(data).key);
    });
  }
  function addMiscMember(group) {
    return groupsRef
      .child(`Administration/${group}/Members`)
      .once("value")
      .then(snap => {
        const index = snap.val() ? snap.val().length : 0;
        const containerKey = groupsRef
          .child("Administration/Containers")
          .push("Unselected").key;
        return groupsRef
          .child(`Administration/${group}/Members/${index}`)
          .set(containerKey);
      });
  }
  function removeMiscMember(groupId, containerId) {
    return groupsRef
      .child(`Administration/${groupId}/Members`)
      .once("value")
      .then(s => {
        const members = s.val();
        members.splice(members.indexOf(containerId), 1);
        return groupsRef
          .child(`Administration/${groupId}/Members`)
          .set(members)
          .then(() => {
            return groupsRef
              .child(`Administration/Containers/${containerId}`)
              .remove();
          });
      });
  }
  function reorder(path, newOrder) {
    return firebase
      .database()
      .ref(path)
      .set(newOrder);
  }
  function remove(path, classId) {
    const promise1 = orderedGroupsRef
      .child(path)
      .once("value")
      .then(snapshot => {
        let order = snapshot.val();
        order.splice(order.indexOf(classId), 1);
        return orderedGroupsRef.child(path).set(order);
      });
    const promise2 = groupsRef.child(`${path}/${classId}`).remove();
    return Promise.all([promise1, promise2]);
  }
  function getDisplayableFaculty() {
    return downloadFaculty().then(d => {
      return {
        earlyChildhood: earlyChildhood(d),
        elementary: getElementary(d),
        middleSchool: getMiddleSchool(d),
        admin: getAdminOrMisc(d, "Administration"),
        //misc: getAdminOrMisc(d, "Misc")
      };
    });
  }
  function getAdminOrMisc(db, type) {
    return db.orderedGroups[type].map(key => {
      const group = { ...db.groups[type][key], Id: key };
      return {
        ...group,
        Members: group.Members
          ? group.Members.map(containerKey => {
              const teacherId = db.groups[type].Containers[containerKey];
              return { ...db.faculty[teacherId], Id: teacherId };
            })
          : []
      };
    });
  }

  function earlyChildhood(db) {
    const nursary = db.orderedGroups.Nursary.map(key => ({
      ...db.groups.Nursary[key],
      Id: key
    }));
    let grades = {};
    const gradeNames = {
      PG: "Playgroup",
      N: "Nursery",
      PK: "Pre-Kindergarten",
      K: "Kindergarten",
      PPG: "Pre-Playgroup"
    };
    for (let _class of nursary) {
      let grade = removeNumbers(_class.Class.split('-')[0]),
        gradeName = gradeNames[grade];
      !grades[gradeName] && (grades[gradeName] = { Classes: {} });
      !grades[gradeName].Classes[_class.Class]
        ? (grades[gradeName].Classes[_class.Class] = {
            Id: _class.Id,
            Teachers: []
          })
        : null;

      grades[gradeName].Classes[_class.Class].Teachers.push({
        Id: _class.Teacher,
        ...db.faculty[_class.Teacher]
      });
    }
    grades[Object.keys(grades)[0]].First = true;
    return grades;
  }

  function getMiddleSchool(db) {
    const middleSchool = db.orderedGroups.MiddleSchool.map(key => {
      const classInfo = db.groups.MiddleSchool[key],
        withTeacher = {
          ...classInfo,
          Id: key,
          Teacher: { ...db.faculty[classInfo.Teacher], Id: classInfo.Teacher }
        };
      return withTeacher;
    });
    const grades = {};
    for (let _class of middleSchool) {
      _class.Grade = _class.Grade.split(' ')[0];
      if (!grades[_class.Grade]) grades[_class.Grade] = { Classes: [] };
      grades[_class.Grade].Classes.push(_class);
    }
    Object.values(grades).forEach(grade => {
      grade.Classes.sort((a, b) =>
        a.Teacher.Name > b.Teacher.Name ? 1 : b.Teacher.Name > a.Teacher.Name ? -1 : 0
      )
    })
    grades[Object.keys(grades)[0]].First = true;
    return grades;
  }
  function getElementary(db) {
    const elementary = db.orderedGroups.Elementary.map(key => {
      const classInfo = db.groups.Elementary[key];
      return {
        ...classInfo,
        Id: key,
        Teachers: (() => {
          let teachers = [];
          typeof classInfo.Teacher == "string"
            ? (classInfo.Teacher = [classInfo.Teacher])
            : null;
          typeof classInfo.Assistants == "string"
            ? (classInfo.Assistants = [classInfo.Assistants])
            : null;
          for (let teacher of classInfo.Teacher || [])
            teachers.push({ ...db.faculty[teacher], Id: teacher });
          for (let teacher of classInfo.Assistants || [])
            teachers.push({ ...db.faculty[teacher], Id: teacher });
          return teachers;
        })()
      };
    });
    let elemGrades = {};
    for (let _class of elementary) {
      if (_class.Room.includes('All Grades')) {
        Object.keys(elemGrades).forEach(grade => elemGrades[grade].Classes.push(_class));
      } else if (_class.Room.includes('Grades')) {
        const gradesRange = _class.Room.split(' ')[1].split('-');
        for (let i = gradesRange[0]; i <= gradesRange[1]; i++) {
          const grade = numberSuffix(String(i));
          elemGrades[grade].Classes.push(_class);
        }
      } else if (_class.Room.includes('Grade')) {
        const grade = numberSuffix(numbersFrom(_class.Room));
        elemGrades[grade].Classes.push(_class);
      } else {
        // If it finds more than one number in the class
        if (numbersFrom(_class.Class).length > 1) {
          const grades = numbersFrom(_class.Class).split('');
          grades.forEach(grade => {
            const g = numberSuffix(grade);
            if (!elemGrades[g]) elemGrades[g] = { Classes: [] };
            elemGrades[g].Classes.push(_class)
          });
        } else {
          const grade = numberSuffix(numbersFrom(_class.Class));
          if (!elemGrades[grade]) elemGrades[grade] = { Classes: [] };
          elemGrades[grade].Classes.push(_class);
        }
      }
    }
    elemGrades[Object.keys(elemGrades)[0]].First = true;

    return elemGrades;
  }
  function removeNumbers(string) {
    const indexOfNumbers = string.indexOf(string.match(/[1-9]/g).join(""));
    return string.slice(0, indexOfNumbers);
  }
  const numbersFrom = str => str.replace(/\D+/g, "");
  const numberSuffix = str => {
    if (str === '') return 'Extra Curriculars'
    switch (str) {
      case "1":
        return "1st";
      case "2":
        return "2nd";
      case "3":
        return "3rd";
      default:
        return str + "th";
    }
  };
  function saveHanukkahOrder(classes) {
    const promises = classes.map(group =>
      addDonorToTeachersInClass(group.ClassPath, group.ChildName)
    );
    return Promise.all(promises);
  }
  function addDonorToTeachersInClass(classPath, childName) {
    return groupsRef
      .child(classPath)
      .once("value")
      .then(snapshot => {
        const group = snapshot.val();
        let teachers = [];
        if (group.Teacher) teachers.push(group.Teacher);
        if (group.Assistants) {
          teachers = teachers.concat(group.Assistants);
        }
        const promises = teachers.map(teacherId =>
          addDonorToTeacher(teacherId, childName)
        );
        return Promise.all(promises);
      });
  }
  function addDonorToTeacher(teacherId, childName) {
    return facultyRef
      .child(teacherId)
      .once("value")
      .then(snapshot => {
        const member = snapshot.val();
        let children = [childName];
        if (member.Donors) {
          children = children.concat(member.Donors);
        }
        return facultyRef.child(`${teacherId}/Donors`).set(children);
      });
  }

  async function getHannukaFaculty () {
    let [faculty, roles, roleArrangements] = await downloadFaculty().then(([f, g, og]) => [f, g, og]);
    faculty = Object.keys(faculty).map(id => {
        const { Info: info, Name: name } = faculty[id];
        return { id, info, name }
    });
    const elementary = Object.keys(roles.Elementary).map(id => {
        const { Assistants, Class, Room, Teacher } = roles.elementary[id];
        return { id, Assistants, Class, Room, Teacher };
    });

  }

  async function getHighschool() {
    const unsorted = await highschoolRef.once('value').then(s => s.val());
    const withIds = Object.keys(unsorted).map(key => ({ id: key, ...unsorted[key] }));
    const sorted = withIds.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
    return sorted;
  }
  return {
    create: createClass,
    get: getFaculty,
    getDisplayable: getDisplayableFaculty,
    update: updateAtPath,
    delete: remove,
    reorderAtPath: reorder,
    saveHanukkahOrder: saveHanukkahOrder,
    addMiscMember: addMiscMember,
    removeMiscMember,
    roles: () => groupsRef.once("value").then(s => s.val()),
    getHighschool
  };
})();
