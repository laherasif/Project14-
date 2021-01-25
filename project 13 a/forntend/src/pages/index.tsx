import React, { useState, useRef, useEffect } from "react"
import { addTodo, deleteTodo, updateTodo } from "../graphql/mutations"
import { getTodos } from "../graphql/queries"
import { API } from "aws-amplify"
import shortid from "shortid"
import Card from '../components/Car'
import Skeleton from "react-loading-skeleton";
import './index.css'
interface title {
  title: string,
  id: string
}

interface incomingData {
  data: {
    getTodos: title[]
  }
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [todoData, setTodoData] = useState<incomingData | null>(null)
  const todoTitleRef = useRef<any>("")
  const [Find, setFind] = useState({ id: '', title: '' })
  const [Load, setLoad] = useState(false)
  const [edit, setEdit] = useState("")
  const [Title, setTitle] = useState("")



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFind(prevState => ({
      ...prevState,
      [name]: value
    }));
  };



  const addTodoMutation = async () => {
    try {
      const todo = {
        id: shortid.generate(),
        title: todoTitleRef.current.value,
        done: false,
      }
      const data = await API.graphql({
        query: addTodo,
        variables: {
          todo: todo,
        },
      })
      todoTitleRef.current.value = ""
      setLoad(true)

      setTimeout(() => {
        fetchTodos()
        setLoad(false)

      }, 1500);
    } catch (e) {
      console.log(e)
    }
  }


  const deletetodo = async (id) => {
    console.log("id ", id);

    try {

      const data = await API.graphql({
        query: deleteTodo,
        variables: {
          todoId: id,
        },
      })
      setLoad(true)
      setTimeout(() => {
        fetchTodos()
        setLoad(false)

      }, 1500);
    } catch (e) {
      console.log(e)
    }
  }


  const FindD = (id) => {
    let findData = todoData.data.getTodos.find(item => { return item.id === id })
    console.log("id", findData);

    setFind(findData)
  }


  const updatetodo = async () => {

    try {
      const todo = {
        id : Find.id,
        title: Find.title,
        done: true,
      }

      console.log("data", todo);

      const data = await API.graphql({
        query: updateTodo,
        variables: {
          todo: todo,
        },
      })
      setLoad(true)
      setTimeout(() => {
        fetchTodos()
        setLoad(false)
        setFind({ id : '' , title : ''})

      }, 1500);
    }
    catch (e) {
      console.log(e)
    }
  }

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({
        query: getTodos,
      })
      console.log("data", data);

      setTodoData(data as incomingData)
      setLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div>

      <div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="main-todo-input-wrap">
                {Find.title == "" ?

                  <div className="main-todo-input fl-wrap">
                    <div className="main-todo-input-item">
                      <input type="text" className="form-control" ref={todoTitleRef} onChange={handleChange} id="todo-list-item" placeholder="What will you do today?" />
                    </div>
                    <button className="add-items main-search-button" onClick={() => addTodoMutation()}>ADD</button>
                  </div>

                  :
                  <div className="main-todo-input fl-wrap">
                    <div className="main-todo-input-item">
                      <input type="text" className="form-control" name="title" value={Find.title} onChange={handleChange} id="todo-list-item" placeholder="What will you do today?" />
                    </div>
                    <button className="add-items main-search-button" onClick={() => updatetodo()}>Update</button>
                  </div>

                }

              </div>
            </div>
          </div>

          {loading && <Card />}
          <div className="row">
            <div className="col-md-12">
              <div className="main-todo-input-wrap">
                <div className="main-todo-input fl-wrap todo-listing">
                  {Load

                    ?
                    todoData.data &&
                    todoData.data.getTodos.map((item, ind) => {
                      return (
                        <ul id="list-items" >


                          <li key={ind}>
                            <Skeleton height={20} />
                          </li>




                        </ul>
                      )
                    })

                    :


                    !loading && todoData.data && todoData.data.getTodos.length > 0 ? todoData.data.getTodos.map((todo, index) => {

                      return (
                        <ul id="list-items" key={index} >


                          <li>{todo.title}
                            <button className="delet-btn" onClick={() => deletetodo(todo.id)}
                              style={{ float: 'right', padding: '5px' }}>X</button>

                            <button className="delet-btn" onClick={() => FindD(todo.id)}
                              style={{ float: 'right', marginRight: '10px', padding: '5px' }}>Edit </button>

                          </li>




                        </ul>

                      )
                    })
                      : null

                  }


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
