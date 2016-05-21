<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\SectoresIndicadore;

class SectoresIndicadores extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request) {
        $indicadorId = $request->input('indicadorId');
        $sectoresId = substr(json_encode($request->input('sectoresId')), 1, -1);
        $sectoresId = explode(',', $sectoresId);

        foreach ($sectoresId as $id) {
            $sectoresIndicadore = new SectoresIndicadore;

            $sectoresIndicadore->sector_id = (int)$id;
            $sectoresIndicadore->indicador_id = $indicadorId;

            $sectoresIndicadore->save();
        }

        return 'true';
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function destroy($sectoresIndicadores) {
        $sectoresIndicadoresId = substr(json_encode($sectoresIndicadores), 1, -1);
        $sectoresIndicadoresId = explode(',', $sectoresIndicadoresId);

        foreach ($sectoresIndicadoresId as $id) {
            $sectoresIndicadore = SectoresIndicadore::find((int)$id);
            $sectoresIndicadore->delete();
        }

        return 'true';
    }
}
