import React from 'react'
import Skeleton from "react-loading-skeleton";

function Card() {



    return (
        <div>
            <div className="row">
                <div className="col-md-12">
                    <div className="main-todo-input-wrap">
                        <div className="main-todo-input fl-wrap todo-listing">

                            {
                                 Array(9)
                                .fill({start : 0 , end : 100})
                                .map((ind:number) =>  {

                                    return (
                                        <ul id="list-items" key={ind}>
                                            <li>
                                                <Skeleton height={20} />
                                            </li>




                                        </ul>

                                    )
                                })
                            

                                }
                            </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card
